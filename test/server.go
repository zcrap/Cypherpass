package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

type sig struct {
	pk  string
	sig string
}

func (s *sig) populate(d string) {
	parts := strings.Split(":", d)
	s.pk = parts[1]
	s.sig = parts[0]
}

func handleReq(w http.ResponseWriter, r *http.Request) {
	var data sig
	if r.Body == nil {
		log.Println("empty request!")
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println(err)
		return
	}
	defer r.Body.Close()
	data.populate(string(body))
	log.Printf("pubKey: '%s' sig: '%s'", data.pk, data.sig)
}

func main() {
	log.Println("test server starting..")
	http.HandleFunc("/", handleReq)
	log.Fatal(http.ListenAndServe("localhost:8321", nil))
}
