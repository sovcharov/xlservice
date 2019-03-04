import * as express from 'express';
import { Application } from 'express';
const app: Application = express();
import {MyNodeConfig} from '../config/mynodeconfig';
const myNodeConfig = new MyNodeConfig();
import { MySqlService } from './services/mysql.service';
const mySqlService = new MySqlService();
import { MyFunctions } from './services/functions.service';
const myFunctions = new MyFunctions();
import { MyXLService } from './services/xls.service';
const myXLService = new MyXLService();
import {MyAWSService} from './services/aws.service';
const myAWSService = new MyAWSService();
import * as http from 'http';



const server = http.createServer(app);
server.listen(myNodeConfig.serverPort, () => { });

app.use(function(req, res, next) {
  let allowedOrigins = myNodeConfig.allowedOrigins;
  let origin : string = String(req.headers.origin);
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  next();
});

app.get('/api/createxlprice', function(req, res) {
  mySqlService.getPriceListData(req.params.company, (priceListData) => {
    myXLService.createXLPrice(priceListData, (xlFile)=>{
      // console.log("BEFORE UPLOAD");
        myAWSService.uploadPrice(xlFile, ()=>{
          myXLService.createXLCross(priceListData, (xlFileCross)=>{
              myAWSService.uploadCross(xlFileCross, ()=>{
                myAWSService.getPriceUpdateDate((data)=>{
                  res.send({data: data, res: "OK"});
                });
              });
          });
        });
    //   myXLService.createXLCross(priceListData, ()=>{
    //   });
    });
  });
});

app.get('/api/getpricelistupdatedate', function(req, res) {
  myAWSService.getPriceUpdateDate((data)=>{
    res.send(data);
  });
});
