package main

import (
	//"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
)

var (
	port = flag.String("port", ":8082", "Listening port for the server")
)

func init() {
	flag.Parse()
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received Request: " + r.URL.Path)
	//http.ServeFile(w, r, r.URL.Path[1:])
	http.FileServer(http.Dir("login"))

	body, _ := ioutil.ReadAll(r.Body)
	fmt.Println(body)

}

//func main() {
//	fmt.Println("listening on port: " + *port)

//	http.HandleFunc("/", handler)
//	http.ListenAndServe(*port, nil)
//}

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	fmt.Println("Listening...")
	http.ListenAndServe(*port, nil)
}
