package main

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// ChaincodeHosp example simple Chaincode implementation
type ChaincodeHosp struct {
}

type Profile struct {
	IDTransaction string    `json:"id_transaction"`
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Contents      []Content `json:"contents"`
}

type Content struct {
	Date        string `json:"date"`
	Information string `json:"information"`
}

func (t *ChaincodeHosp) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("init")
	return shim.Success(nil)
}

func (t *ChaincodeHosp) initProfile(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	// "ID", "Name", "Date", "Information"
	if len(args) < 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	IDTransaction := args[0]
	ID := args[1]
	Name := args[2]
	Date := args[3]
	Information := args[4]

	var Contents []Content

	// ==== Check if product already exists ====
	resultAsBytes, err := stub.GetState(ID)
	if err != nil {
		return shim.Error("Failed to get result: " + err.Error())
	} else if resultAsBytes != nil {
		resultOld := Profile{}
		err = json.Unmarshal(resultAsBytes, &resultOld)
		if err != nil {
			return shim.Error(err.Error())
		}
		Content := Content{Date, Information}
		Contents = append(resultOld.Contents, Content)
		resultOld.IDTransaction = IDTransaction
		resultOld.Name = Name

		resultJSONasBytes, err := json.Marshal(resultOld)
		if err != nil {
			return shim.Error(err.Error())
		}

		// === Save product to state ===
		err = stub.PutState(ID, resultJSONasBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(nil)

	} else {
		Content := Content{Date, Information}
		Contents = append(Contents, Content)

		result := &Profile{IDTransaction, ID, Name, Contents}

		resultJSONasBytes, err := json.Marshal(result)
		if err != nil {
			return shim.Error(err.Error())
		}

		// === Save product to state ===
		err = stub.PutState(ID, resultJSONasBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(nil)

	}
}

func (t *ChaincodeHosp) deleteProfile(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	ID := args[1]

	resultAsBytes, err := stub.GetState(ID)
	if err != nil {
		return shim.Error("Failed to get result:" + err.Error())
	} else if resultAsBytes == nil {
		return shim.Error("result does not exist")
	}

	err = stub.DelState(ID) //remove the product from chaincode state
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	return shim.Success(nil)
}

func (t *ChaincodeHosp) getProfileByID(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	ID := args[0]

	queryString := fmt.Sprintf("{\"selector\":{\"id\":\"%s\"}}", ID)

	queryResults, err := getValueQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

func (t *ChaincodeHosp) getAllProfile(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	queryString := fmt.Sprintf("{\"selector\":{\"id\":{\"$gt\":null}}}")

	queryResults, err := getValueQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

func getValueQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getValueQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}

func (t *ChaincodeHosp) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Result information Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "getProfileByID" {
		// get
		return t.getProfileByID(stub, args)
	} else if function == "getAllProfile" {
		// get all
		return t.getAllProfile(stub, args)
	} else if function == "initProfile" {
		// create
		return t.initProfile(stub, args)
	} else if function == "deleteProfile" {
		// delete
		return t.deleteProfile(stub, args)
	}

	return shim.Error("Invalid invoke function name")
}

func main() {
	err := shim.Start(new(ChaincodeHosp))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
