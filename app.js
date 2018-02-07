"use strict";

var level = require('level')
var randomString = require('random-string');
var CryptoJS = require("crypto-js");


const db = level('./.localpass')
const secret = "secret"

readFromDbKey(secret); //read the secret key previously stored from Db and populate in field

function Tag(tagid, tag){
	this.tagid=tagid;
	this.tag= tag;
}

function TaggedPassword(tag_obj,pw){
	this.tag_obj= tag_obj;
	this.password= pw;
}

$("#save").click(function(e) {
    e.preventDefault();
    var password = $("#password").val();
    var tag = $("#tag").val();
    var uuid = randomString();
    writeToDb(new TaggedPassword(new Tag(uuid,tag), password))
});

$("#search-button").click(function(e) {
    e.preventDefault();
    var tag = $("#tag-search").val();
    readFromDb(tag);
});

$("#savekey").click(function(e) {
    e.preventDefault();
    var key = $("#secretkey").val();
   	writeToDbSetting(secret,key);
   	keymain = key
});

$("#showtags").click(function(e) {
    e.preventDefault();
    showAllKeys();
});

//clean up this function because it is doing two things
function readFromDbKey(secret){
	// 3) Fetch by key
    db.get(secret, function (err, value) {
		if (err) 
			return console.log('Ooops!', err) // likely the key was not found
			$("#secretkey").empty(); 
			$("#secretkey").val(value); //load it into the secret key input
	 })
	
}

function readFromDb(tag){
	// 3) Fetch by key
  db.get(tag, function (err, value) {
    if (err) {
    	$(".search-results").empty()
    	return console.log('Ooops!', err) // likely the key was not found
    }
    
    var taggedpass = JSON.parse(CryptoJS.AES.decrypt(value.toString(),$("#secretkey").val()).toString(CryptoJS.enc.Utf8) );
	$(".search-results").empty()
	$(".search-results").append('<input type="text"'+"value="+taggedpass.password  +'>')
   
  })
}

function writeToDb(tp){
	// 2) Put a key & value
	db.put(tp.tag_obj.tag, CryptoJS.AES.encrypt(JSON.stringify(tp), 
		$("#secretkey").val()), function (err) {
	  if (err) return console.log('Ooops!', err) // some kind of I/O error 
	})
}

function showAllKeys(){
	$(".tags-result").empty()
	db.createReadStream({ keys: true, values: false })
  	.on('data', function (data) {
    	
		$(".tags-result").append("<span class='badge'>" +
									data+"</span>")
    	
    	//to-do : create a table out of all the tags
  	})
}

function writeToDbSetting(sec, key){
	db.put(sec, key, function (err) {
	  if (err) return console.log('Ooops!', err) // some kind of I/O error 
	  	readFromDbKey(secret); 
	})

}