'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode Invoke
 */
var program = require("commander");
var defaultConfig = require("./config");
var path = require('path');
const fs = require("fs");

program
    .version("0.1.0")
    .option("-u, --user []", "User id", "user1")
    .option("--name, --channel []", "A channel", "mychannel")
    .option("--chaincode, --chaincode []", "A chaincode name", "mycc")
    .option("--host, --host []", "Host", defaultConfig.peerHost)
    .option("--ehost, --event-host []", "Host", defaultConfig.eventHost)
    .option("--ohost, --orderer-host []", "Host", defaultConfig.ordererHost)
    .option("-m, --method []", "A method", "invoke")
    .option("--quantity, --quantity []", "Quantity queries tx", "128")
    .option(
        "-a, --arguments [value]",
        "A repeatable value",
        (val, memo) => memo.push(val) && memo,
        []
    )
    .parse(process.argv);

// node invoke.js -a a -a b -a 1
var store_path = path.join(__dirname, 'hfc-key-store');
const config = Object.assign({}, defaultConfig, {
    channelName: program.channel,
    user: program.user,
    storePath: store_path
});

var controller = require("./controller")(config);

var request = {
    //targets: let default to the peer assigned to the client
    chaincodeId: program.chaincode,
    fcn: program.method,
    args: program.arguments
};

controller
.invoke(program.user, request)
.then(result => {
    var endedTime = Date.now();
    // console.log("Numerical order", val + 1);
    console.log("Invoke result: ", result);
})
.catch(err => {
    console.error(err);
});

/*
function getLastId() {
    return new Promise((resolve, reject) => {
        fs.readFile('last_result_id.txt', 'utf8', function(err, contents) {
            var lines = contents.split('\n');
            resolve(lines[0]);
        })
    });
}
var lastId = -1;
async function startTesting(){
    lastId = await getLastId();
    var request = {
        //targets: let default to the peer assigned to the client
        chaincodeId: program.chaincode,
        fcn: program.method,
        args: program.arguments
    };

    var quantity = parseInt(program.quantity);
    var quantities = [];
    for (let count = 0; count < quantity; count++){
        quantities.push(count);
    }    

    const getTimeInvoke = quantities.map((val) => {
        var startedTime = Date.now();
        request.args[0] = parseInt(lastId) + parseInt(val);
        request.args[0] = request.args[0].toString();
        return controller
            .invoke(program.user, request)
            .then(result => {
                var endedTime = Date.now();
                // console.log("Numerical order", val + 1);
                // console.log("Invoke result: ", result);
                return [endedTime, (endedTime - startedTime)] ;
            })
            .catch(err => {
                console.error(err);
            });
    });
    return Promise.all(getTimeInvoke).then(results => {
        lastId = parseInt(lastId) + quantity;
        fs.writeFile('last_result_id.txt', lastId + "\n", (error) => {});

        for (let count = 0; count < results.length; count++){
            var result = results[count];

            fs.appendFile('throughput.txt', result[0] + "\n", (error) => {});
            fs.appendFile('latency.txt', result[1] + "\n", (error) => {});            
        }
        return results;
    })
}

startTesting().then(results => {
    console.log("Testing done!");
    console.log("Calculating results...");
    var _ = new Promise((resolve, reject) => {
        fs.readFile('latency.txt', 'utf8', function(err, contents) {
            var lines = contents.split('\n');
            lines = lines.slice(0, -1);
            var totalTime = 0;
            for (let count = 0; count < lines.length - 1; count++){
                lines[count] = parseFloat(lines[count]);
                totalTime += lines[count];
            }
            var latency = totalTime/(lines.length * 1000);
            resolve([latency, lines]);
            // console.log("Latency (s):", latency.toFixed(4), "with " + lines.length + " Txs");
            

        })
    }).then(results => {
            var latency = results[0];
            var lines = results[1];
            fs.appendFile('invoke_result.txt', "Latency (s): " + latency.toFixed(4) + " with " + lines.length + " Txs" + "\n", (error) => {});
        })
    
    var __ = new Promise((resolve, reject) => {
        fs.readFile('throughput.txt', 'utf8', function(err, contents) {
            var lines = contents.split('\n');
            lines = lines.slice(0, -1);
            var minTime = Date.now(), maxTime = 0;

            for (let count = 0; count < lines.length ; count++){
                lines[count] = parseFloat(lines[count]);
                if(minTime > lines[count]){
                    minTime = lines[count];
                }
                if(maxTime < lines[count]){
                    maxTime = lines[count];
                }
            }
            var throughput = (lines.length * 1000)/(maxTime - minTime);
            resolve([throughput, lines]);
            // console.log("Throughput (s):", throughput.toFixed(4), "with " + lines.length + " Txs");            
        });
    }).then(results => {
            var throughput = results[0];
            var lines = results[1];
            fs.appendFile('invoke_result.txt', "Throughput (s): " + throughput.toFixed(4) + " with " + lines.length + " Txs" + "\n", (error) => {});
        })
});
*/