all: index.html keyex.png localstorage.png

index.html: makefile key-exchange-helper.html mandihe.rb
	haml -Eutf-8 index.haml > index.html

key-exchange-helper.html: makefile index.haml key-exchange-helper.haml
	haml -Eutf-8 key-exchange-helper.haml > key-exchange-helper.html

localstorage.png: localstorage.dot
	dot localstorage.dot -Tpng > localstorage.png

keyex.png: keyex.dot
	dot keyex.dot -Tpng > keyex.png