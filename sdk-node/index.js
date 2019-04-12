var express = require("express");
var app = express();
var formidable = require('formidable');
var fs = require('fs');
const delay = require('delay');



var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var thongbao;

const program = require('commander');

'use strict';


// cau hinh ejs
app.set("view engine", "ejs");
app.set("views", "./views");

var defaultConfig = require("./config");
var path = require('path');



var store_path = path.join(__dirname, 'wallet/admin');

// 

/////////////////////////////////////////////////
app.use(express.static('public'));


const config = Object.assign({}, defaultConfig, {
    channelName: "mychannel",
    user: "user2",
    storePath: store_path

});

var controller = require("./controller")(config);

var request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: "demo",
    fcn: "",
    args: ['']
};
                            
//////--->
app.get("/home", function(req, res){
    res.render("index");
});
//
app.get("/profile", function(req, res){
    res.render("product/index");
});

app.get("/create-profile",function(req, res){
    res.render("product/create_product", {thongbao: "200"});
});

app.get("/delete-profile", function(req, res){
    res.render("product/delete_product");
});

app.get("/get-profile", function(req, res){
    res.render("product/get_product");
});

// app.get("/app.js", (req,res)=>{
//     res.render ("product/app");
// })

app.get("/submit-eth", function(req, res){
    res.render("product/index");
});

app.post("/create-profile", urlencodedParser, function(req, res){
   
    var product = [];
    var form =  new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        
        product[0] = fields.id
        product[1] = fields.name
        product[2] = fields.date
        product[3] = fields.information

        request.fcn = "initProfile";
        request.args = product;

        controller
        .invoke(config.user, request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            res.render("product/create_product", {thongbao: "success"});
        })
        .catch(err => {
            console.error(err);
            res.render("product/create_product");
        });
        
    })

});

app.get("/list-profile",function(req, res){
    request.fcn = "getAllProfile";
    console.log(request);
        
        controller
            .query(config.user, request)
            .then(ret => {

                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    res.render("product/list_product", {products : products });
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.get("/get-profile/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getProfileByID";
        request.args = [id];
        console.log(request);
        
        controller
        .query(config.user, request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);

                res.render("product/get_product",{ product : product});
            } else {
                console.log("Loi khong tim thay");
                res.render("404_notfound")
            }
        })
        .catch(err => {
            console.error(err);
        });

    }
    else {
        res.render("");
    }
});

app.get("/delete-profile/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);
    if(typeof id !== "undefined"){
        request.fcn = "deleteProduct";
        request.args = [id];
        console.log("request: ", request);
            controller
                .invoke(config.user, request)
                .then( results => {
                    console.log(
                        "Send transaction promise and event listener promise have completed",
                        results
                    );

                    request.args = [''];
                    res.render('notify');
                })
                .catch(err => {
                    console.error(err);
                    res.redirect('/list-product');

                });
    } else {
        res.render("");
    }
});


app.post("/delete-profile", urlencodedParser, function(req, res){

    var id = req.body.id;
    request.fcn = "deleteProduct";
    request.args = [id];
    console.log("request: ", request);
        controller
            .invoke(config.user, request)
            .then(results => {
                console.log(
                    "Send transaction promise and event listener promise have completed",
                    results
                );
                request.args = [''];
                res.render('notify');

            })
            .catch(err => {
                console.error(err);
                res.redirect('/list-profile');

            });
});

app.listen(4200);