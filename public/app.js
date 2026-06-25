const socket = io();


let room="";




// CREATE

function createRoom(){


fetch("/create")
.then(r=>r.json())
.then(data=>{


room=data.code;


document.getElementById("room")
.innerHTML =
"Room: "+room;



document.getElementById("code")
.value=room;



socket.emit(
"join",
room
);



});


}






// JOIN


function joinRoom(){


room =
document.getElementById("code")
.value
.trim()
.toUpperCase();



if(!room){

alert("Enter code");

return;

}



if(room){

    socket.emit(
        "join",
        room
    );

}
else{

    alert("Enter room code");

}



}






// UPLOAD


function uploadFile(){


let file =
document.getElementById("file")
.files[0];


if(!file){

alert("Select file");

return;

}



let data=new FormData();


data.append(
"file",
file
);




fetch(
"/upload/"+room,
{

method:"POST",

body:data

});


}







socket.on(
"files",
files=>{


document.getElementById("list")
.innerHTML="";


files.forEach(show);


});





socket.on(
"newFile",
file=>{


show(file);


});





socket.on(
"joined",
room=>{


alert(
"Connected to "+room
);


});





socket.on(
"error",
msg=>{

alert(msg);

});







function show(file){


let li=document.createElement("li");



li.innerHTML =
file.name+
" <a href='/download/"
+file.url+
"'>Download</a>";



document
.getElementById("list")
.appendChild(li);



}