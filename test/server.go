package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	cypher "test/cypherpass"
)

var (
	port    = flag.String("port", ":8080", "Listening port for the server")
	letters = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_") //Used for random string generation
	//File structure vars.
	//Should NOT include slashes.
	dir          = "login"
	header       = "header.html"
	footer       = "footer.html"
	pageNotFound = "404.html"
	startPage    = "login.html"

	//Valid static resources.  Dirs should include preceding /.
	servs = []string{"/css", "/img"}
)

type Page struct {
	Filename string
	Body     []byte
	Header   template.HTML
	Footer   template.HTML
}

type Template struct {
	Page *Page
	Vars map[string]string
}

func init() {
	flag.Parse()
}

//Signed challenge.
type SC struct {
	PublicKey string `json:"public_key"`
	Signed    string `json:"signed"`
	Challenge string `json:"challenge"`
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Listening on " + *port)

	http.ListenAndServe(*port, nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path
	fmt.Println("Received Request: " + file)

	if file == "/" {
		http.Redirect(w, r, startPage, 301)
	}

	//Static resources or template.
	sevFile := false
	for _, v := range servs {
		if strings.HasPrefix(file, v) {
			sevFile = true
			break
		}
	}
	if sevFile {
		//asking for a static resource
		http.ServeFile(w, r, dir+file)
	} else {
		//Try to fill request with template
		servTemplate(w, r)
	}

}

func servTemplate(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path

	c := getTVars(r)

	p, err := loadPage(file)
	if err != nil {
		fmt.Println("Error Loading page: ", err.Error())
		p, err = loadPage(pageNotFound)
	}
	data := &Template{p, c}

	err = renderTemplate(w, data)
	if err != nil {
		fmt.Println("Error rendering template: ", err.Error())
	}
}

//Get template vars
func getTVars(r *http.Request) (c map[string]string) {
	r.ParseForm()

	sig := r.FormValue("signature")
	fmt.Println("sig: ", sig)
	var ver string
	var dat SC

	if err := json.Unmarshal([]byte(sig), &dat); err != nil {
		fmt.Println(err.Error())
	} else {
		v, err := cypher.VerifySigHex(dat.PublicKey, dat.Challenge, dat.Signed)
		if err == nil && v == true {
			fmt.Println("key verified: ", v)
			ver = "Signature Verified"
		} else {
			log.Println("Signature not verified.", dat.Signed)
			ver = "Signature Invalid"

		}
	}

	c = map[string]string{"challenge": randSeq(50), "body": "", "signature_verified": ver}
	return c
}

//Read the page into memory.
//Return page with page details in struct.
func loadPage(filename string) (*Page, error) {
	body, err := ioutil.ReadFile(dir + "/" + filename)
	if err != nil {
		return nil, err
	}

	head, err := ioutil.ReadFile(dir + "/" + header)
	if err != nil {
		return nil, err
	}

	foot, err := ioutil.ReadFile(dir + "/" + footer)
	if err != nil {
		return nil, err
	}

	return &Page{
		Filename: filename,
		Body:     body,
		Header:   template.HTML(head),
		Footer:   template.HTML(foot),
	}, nil
}

func renderTemplate(w http.ResponseWriter, tem *Template) (err error) {
	fmt.Println("Template Struct: ", tem)
	t, err := template.ParseFiles(dir + "/" + tem.Page.Filename)
	if err != nil {
		return err
	}

	return t.Execute(w, tem)
}

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
