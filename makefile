index.html: makefile key-exchange-helper.html mandihe.rb
	haml -Eutf-8 index.haml > index.html

key-exchange-helper.html: makefile index.haml key-exchange-helper.haml
	haml -Eutf-8 key-exchange-helper.haml > key-exchange-helper.html

