package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strings"
)

type sig struct {
	PK  string
	SIG string
}

var reqInURL = regexp.MustCompile("/?/g")

func (s *sig) populate(r *http.Request) error {
	if reqInURL.FindString(r.URL.Path) != "" {
		parts := strings.Split(":", r.URL.Path)
		s.PK = parts[1]
		s.SIG = parts[0]
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println(err)
			return err
		}

		err = json.Unmarshal(body, &s)
		if err != nil {
			log.Println(err)
			return err
		}

	}
	return nil
}

func parseBody(r *http.Request) (*sig, error) {
	var data sig
	if r.Body == nil {
		log.Println("empty request!")
		return nil, errors.New("empty request")
	}

	err := data.populate(r)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func handleReq(w http.ResponseWriter, r *http.Request) {
	data, err := parseBody(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("pubKey: '%s' sig: '%s'", data.PK, data.SIG)
}

func main() {
	log.Println("test server starting..")
	http.HandleFunc("/", handleReq)
	log.Fatal(http.ListenAndServe("localhost:8321", nil))
}
