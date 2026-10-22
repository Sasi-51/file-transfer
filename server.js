const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


const app = express();

const server = http.createServer(app);


const io = new Server(server,{
    cors:{
        origin:"*"
    }
});


// frontend
app.use(express.static("public"));


//upload folder

const uploadDir = path.join(__dirname,"uploads");


if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}




// multer config

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,uploadDir);

    },


    filename:(req,file,cb)=>{

        cb(
            null,
            Date.now()+"-"+file.originalname
        );

    }

});


const upload = multer({
    storage
});






// rooms

let rooms = {};



function createCode(){

    return Math.random()
    .toString(36)
    .substring(2,6)
    .toUpperCase();

}






// test

app.get("/ping",(req,res)=>{

    res.send("SERVER OK");

});







// create room

app.get("/create",(req,res)=>{


    let code;


    do{

        code=createCode();

    }
    while(rooms[code]);



    rooms[code]={

        files:[]

    };



    console.log(
        "Room created:",
        code
    );



    setTimeout(()=>{

        removeRoom(code);

    },600000);



    res.json({

        code:code

    });


});









// upload file

app.post(
"/upload/:room",
upload.single("file"),
(req,res)=>{


    let room =
    String(req.params.room)
    .toUpperCase();



    if(!rooms[room]){

        return res.status(400)
        .json({

            error:"Room expired"

        });

    }



    if(!req.file){

        return res.status(400)
        .json({

            error:"No file"

        });

    }





    let file={

        name:req.file.originalname,

        url:req.file.filename

    };




    rooms[room].files.push(file);




    io.to(room)
    .emit(
        "newFile",
        file
    );




    res.json({

        success:true

    });


});











// download

app.get(
"/download/:file",
(req,res)=>{


    let filePath =
    path.join(
        uploadDir,
        req.params.file
    );



    if(!fs.existsSync(filePath)){

        return res.status(404)
        .send("File not found");

    }



    res.download(filePath);


});









// SOCKET.IO

io.on(
"connection",
(socket)=>{


    console.log(
        "Connected:",
        socket.id
    );



    socket.on(
    "join",
    (room)=>{


        if(!room){

            socket.emit(
                "error",
                "Room code required"
            );

            return;
        }




        room =
        String(room)
        .trim()
        .toUpperCase();




        if(!rooms[room]){


            socket.emit(
                "error",
                "Room not found"
            );

            return;

        }




        socket.join(room);



        socket.emit(
            "files",
            rooms[room].files
        );



        socket.emit(
            "joined",
            room
        );



        console.log(
            "Joined:",
            room
        );


    });


});











// remove room

function removeRoom(room){


    if(!rooms[room])
        return;



    rooms[room].files.forEach(file=>{


        let p =
        path.join(
            uploadDir,
            file.url
        );



        if(fs.existsSync(p)){

            fs.unlinkSync(p);

        }


    });




    delete rooms[room];



    console.log(
        "Removed room:",
        room
    );


}









// START SERVER

const PORT =
process.env.PORT || 3000;



server.listen(
PORT,
"0.0.0.0",
()=>{


    console.log(
        "===================="
    );

    console.log(
        "LAN TRANSFER SERVER"
    );

    console.log(
        "PORT:",
        PORT
    );

    console.log(
        "===================="
    );


});
