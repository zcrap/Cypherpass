package main

import (
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	//cypher "test/cypherpass"
)

var (
	port    = flag.String("port", ":8080", "Listening port for the server")
	letters = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_")
	dir     = "login"
)

type Page struct {
	Filename string
	Body     []byte
}

type Template struct {
	Page *Page
	Vars map[string]string
}

func init() {
	flag.Parse()

}

func main() {
	//cypher.Hello()
	//cypher.Run()
	http.HandleFunc("/", handler)
	http.HandleFunc("/login/", viewHandler)
	fmt.Println("Listening on " + *port)

	http.ListenAndServe(*port, nil)
}

func loadPage(filename string) (*Page, error) {
	body, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	return &Page{Filename: filename, Body: body}, nil
}

func renderTemplate(w http.ResponseWriter, tem *Template) {
	t, _ := template.ParseFiles(tem.Page.Filename)

	t.Execute(w, tem)
}

func viewHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received Request: " + r.URL.Path)
	//file := r.URL.Path[len("/login/"):]
	file := r.URL.Path[1:]
	p, _ := loadPage(file)

	b, _ := ioutil.ReadAll(r.Body)
	body, _ := url.QueryUnescape(string(b))

	c := map[string]string{"challenge": randSeq(50), "body": string(body)}

	data := &Template{p, c}

	renderTemplate(w, data)
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received Request: " + r.URL.Path)
	file := dir + "/" + r.URL.Path[1:]
	fmt.Println("Serving: " + file)

	http.ServeFile(w, r, file)
}

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
