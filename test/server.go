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

	body, _ := ioutil.ReadAll(r.Body)
	fmt.Println(body)

}

func main() {
	fmt.Println("listening on port: " + *port)

	http.HandleFunc("/", handler)
	http.ListenAndServe(*port, nil)
}
