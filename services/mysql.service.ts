import * as mysql from 'mysql';
import { MySqlConnection } from '../../config/dbconnectmysqlnode.js';
let mySqlConnection = new MySqlConnection;

export class MySqlService {

  constructor() {

  }

  getPriceListData(company, callback) {
    company = company;
    let items = [];
    let query = `SELECT i.id, i.description, i.comment, i.price, i.stock, i.ordered, i.msk, n.number, m.fullName as manufacturerFullName, n.main FROM seltexru.inventory as i, seltexru.inventoryNumbers as n, seltexru.inventoryManufacturers as m where i.id = n.inventoryId and n.manufacturerId = m.id and (i.description like '%cat%' or i.comment like '%cat%' or i.description like '%prodiesel%' or i.comment like '%prodiesel%') and (i.description not like '%core%' and i.comment not like '%core%')`;
    let connection = mysql.createConnection(mySqlConnection);
    connection.query(query, function (error, results) {
      if  (error) {
        console.log(`ERROR: ${error}`);
      }
      let currentId: number = 0;
      for (let i: number = 0; i < results.length; i += 1) {
        if (currentId !== results[i].id) {

          currentId = results[i].id;
          items[items.length] = results[i];
          items[items.length-1].numbers = [];
          items[items.length-1].numbersString = "";
          items[items.length-1].numberMain = "";
          items[items.length-1].manufacturer = "";

        }
        if(results[i].main) {
          items[items.length-1].numbers.unshift({
            number: results[i].number,
            manufacturerFullName: results[i].manufacturerFullName,
            main: results[i].main
          });
          items[items.length-1].numbersString = `${results[i].number} ${items[items.length-1].numbersString}`;
          items[items.length-1].numberMain = results[i].number;
          items[items.length-1].manufacturer = results[i].manufacturerFullName;

        } else {
          items[items.length-1].numbers[items[items.length-1].numbers.length] = {
            number: results[i].number,
            manufacturerFullName: results[i].manufacturerFullName,
            main: results[i].main
          };
          items[items.length-1].numbersString = `${items[items.length-1].numbersString} / ${results[i].number}`;
        }
      }
      callback(items);
    });
    connection.end();
  }

  public priceListCreateStart(company, callback) {
    let query = `call priceListCreateStart('${company}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error', function(err) {
        console.log(err);
      })
      // .on('result', (row) => {
      //   items[items.length] = row;
      // })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        // items.splice(items.length - 1, 1);
        callback();
      });
    connection.end();
  };

  public priceListCreateFinish(company, callback) {
    let query = `call priceListCreateFinish('${company}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error', function(err) {
        console.log(err);
      })
      // .on('result', (row) => {
      //   items[items.length] = row;
      // })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        // items.splice(items.length - 1, 1);
        callback();
      });
    connection.end();
  };

  public priceListCreateGetStatus(company, callback) {
    let items = [];
    let query = `call priceListCreateGetStatus('${company}')`;
    let connection = mysql.createConnection(mySqlConnection);
    let request = connection.query(query);
    request
      .on('error', function(err) {
        console.log(err);
      })
      .on('result', (row) => {
        items[items.length] = row;
      })
      .on('end', () => {
        // let's get rid of OkPacket that arrives after stored procedure
        items.splice(items.length - 1, 1);
        callback(items);
      });
    connection.end();
  };

}
