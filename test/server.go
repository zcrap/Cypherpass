package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
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
	//directory to serve files from.
	dir          = "login"
	header       = "header.html"
	footer       = "footer.html"
	pageNotFound = "404.html"

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

type sc struct {
	PublicKey string
	Challenge string
	Signature string
}

func main() {
	cypher.Test()
	http.HandleFunc("/", handler)
	fmt.Println("Listening on " + *port)

	http.ListenAndServe(*port, nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path
	fmt.Println("Received Request: " + file)

	sevFile := false

	for _, v := range servs {
		if strings.HasPrefix(file, v) {
			sevFile = true
			break
		}
	}
	if sevFile {
		http.ServeFile(w, r, dir+file)
	} else {
		//Asking for a template
		servTemplate(w, r)
	}

}

func servTemplate(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path

	r.ParseForm()

	//Print all values in Form
	//	for k, v := range r.Form {
	//		fmt.Println("key:", k)
	//		fmt.Println("val:", strings.Join(v, ""))
	//	}

	//	var dat map[string]interface{
	//		Public
	//	}

	var dat struct {
		PublicKey string `json:"public_key"`
		Signed    string `json:"signed"`
		Challenge string `json:"challenge"`
	}

	//PANIC KILL THIS

	if err := json.Unmarshal([]byte(r.Form["signature"][0]), &dat); err != nil {
		fmt.Println(err.Error())
	} else {
		v, err := cypher.VerifySigHex(dat.PublicKey, dat.Challenge, dat.Challenge)
		fmt.Println("key verified: ", v, err)
	}

	//	var dat map[string]interface{}
	//	if err := json.Unmarshal([]byte(r.Form["signature"][0]), &dat); err != nil {
	//		fmt.Println(err.Error())
	//	} else {
	//		fmt.Println(dat)
	//	}

	//Vars to pass into the template
	c := map[string]string{"challenge": randSeq(50), "body": ""}
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

func servFile(w http.ResponseWriter, r *http.Request) {

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

func viewHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received Request: " + r.URL.Path)

	fmt.Println("method:", r.Method) //get request method
	if r.Method == "GET" {
		handler(w, r)
	} else {
		r.ParseForm()
		// logic part of log in
		fmt.Println("username:", r.Form["username"])
		fmt.Println("password:", r.Form["password"])
		fmt.Println("bob:", r.Form["bob"])
		fmt.Println("signature:", r.Form["signature"])

		fmt.Println("Body: ", r.Body)
	}

	//Load the html template file
	//file := r.URL.Path[len("/login/"):]
	file := r.URL.Path[1:]
	p, _ := loadPage(file)

	fmt.Print("body:/n ", r.Body)

	//Print all values in Form
	for k, v := range r.Form {
		fmt.Println("key:", k)
		fmt.Println("val:", strings.Join(v, ""))
	}

	var dat map[string]interface{}
	if err := json.Unmarshal([]byte(r.Form["signature"][0]), &dat); err != nil {
		fmt.Println(err.Error())
	} else {
		fmt.Println(dat)
	}

	c := map[string]string{"challenge": randSeq(50), "body": string("bob")}

	data := &Template{p, c}

	renderTemplate(w, data)
}
