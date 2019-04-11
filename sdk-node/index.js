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

// var defaultConfig = require("./config");
var path = require('path');



var store_path = path.join(__dirname, 'wallet/admin');

// 

/////////////////////////////////////////////////
app.use(express.static('public'));


const config = Object.assign({}, {
    channelName: "mychannel",
    user: "user2",
    storePath: store_path

});

var controller = require("./controller")(config);

var request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: "fist-origin",
    fcn: "",
    args: ['']
};
                            
//////--->
app.get("/home", function(req, res){
    res.render("index");
});
//
app.get("/product", function(req, res){
    res.render("product/index");
});

app.get("/create-product",function(req, res){
    res.render("product/create_product", {thongbao: "200"});
});

app.get("/delete-product", function(req, res){
    res.render("product/delete_product");
});

app.get("/get-product", function(req, res){
    res.render("product/get_product");
});

app.get("/update-certificate/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByFishID";
        request.args = [id];
        console.log(request);
        
        controller
        .query("user8", request)
        .then(ret => {
            product = JSON.parse(ret.toString())[0];
            if (typeof product !== "undefined") {
                console.log("product: ", product);

                res.render("orgcertificate/update_certificate",{ product : product});
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
//

app.post("/create-product", urlencodedParser, function(req, res){
   
    var product = [];
    var newpath ;
    var form =  new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.image_package.path;
        newpath = '/home/luatcoi/Project/src/HPT/sdk-node/public/dist/img/' + files.image_package.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        
        product[0] = fields.fish_id
        product[1] = fields.name
        product[2] = fields.weight_package
        product[3] = '/dist/img/' + files.image_package.name
        product[4] = fields.time_fishing
        product[5] = fields.address_fishing

        request.fcn = "initProduct";
        request.args = product;

        controller
        .invoke("user8", request)
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

app.get("/list-product",function(req, res){
    request.fcn = "getAllProduct";
    console.log(request);
        
        controller
            .query("user8", request)
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

app.get("/get-product/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);

    if (typeof id !== "undefined") {

        request.fcn = "getResultByFishID";
        request.args = [id];
        console.log(request);
        
        controller
        .query("user8", request)
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

app.get("/delete-product/:id", function(req, res){
    var id = req.params.id;
    console.log("id: ", id);
    if(typeof id !== "undefined"){
        request.fcn = "deleteProduct";
        request.args = [id];
        console.log("request: ", request);
            controller
                .invoke("user8", request)
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

app.post("/delete-product", urlencodedParser, function(req, res){

    var id = req.body.fish_id;
    request.fcn = "deleteProduct";
    request.args = [id];
    console.log("request: ", request);
        controller
            .invoke("user8", request)
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
                res.redirect('/list-product');

            });
});

app.get("/list-update-certificate",function(req, res){
    request.fcn = "getAllProductNotCertificate";
    console.log(request);
        
        controller
            .query("user8", request)
            .then(ret => {
                console.log( "Query results 23131: ",JSON.parse(ret.toString()));

                products = JSON.parse(ret.toString());
                console.log("products: ", products);
                if (typeof products !== "undefined") {
                    res.render("product/list_update_certificate", {products : products });
                } else {
                    console.log("Loi khong tim thay");
                    res.render("404_notfound")
                }
            })
            .catch(err => {
                console.error(err);
            });
});

app.post("/update-certificate/:id",urlencodedParser ,function(req, res){
    var product_info =["fish_id", "code_certification", 
    "name_org_certification", "date_certification"];
    var id = req.params.id;
    console.log("id: ", id);
    var product = [id];

    for(var i=1; i<product_info.length; i++){
        var sp = product_info[i];
        product[i]=req.body[sp];
    }

    console.log("string input", product);
    // each method require different certificate of user

    request.fcn = "updateCertificate";
    request.args = product;

    controller
        .invoke("user8", request)
        .then(results => {
            console.log(
                "Send transaction promise and event listener promise have completed",
                results
            );
            res.redirect('/list-update-certificate');
        })
        .catch(err => {
            console.error(err);
            res.redirect('/list-update-certificate');
        });
});

app.post("/delete-product", urlencodedParser, function(req, res){

    var id = req.body.fish_id;
    request.fcn = "deleteProduct";
    request.args = [id];
    console.log("request: ", request);
        controller
            .invoke("user8", request)
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
                res.redirect('/list-product');

            });
});

app.listen(4200);