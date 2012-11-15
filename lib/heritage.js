// sublime: tab_size 2; translate_tabs_to_spaces true

var url = require('./url.js');
var fetchUrl = require("fetch").fetchUrl; //https://github.com/andris9/fetch

module.exports = function(config) {

  var heritage =
  {
    manual: {
      get_json: function (uri, cb) {
        fetchUrl(uri, function(error, meta, body){
            if(typeof body != 'undefined') {
              var data = JSON.parse(body.toString());
              cb(data);
            } else {
              cb(null);
            }
        });
      },
      catalog: {
        product: {
          info: {
            url: function (sku, cb) {
              value = decodeURIComponent(sku)
              var url_string = config.host + config.path;
              url_string = url.setParameterUrl(url_string, config.sku_var_name, value);
              url_string = url.setParameterUrl(url_string, config.login, config.pass);
              url_string = encodeURIComponent(url_string);
              if(cb != null)
                cb(url_string);
              else
                return url_string;
            },
            /*
             * Zerteilt die description in einzele Attribute
             */
            split_description_data: function (data) {
              var description = {};
              description.values = data.DESCRIPTION.toString().split('$');
              //description.names = new Array(description.values.length);

              switch (description.values.length) {
                case 5:
                  var metrics = description.values[4].replace(/\'/g, "&#39;");
                  if(metrics.length > 1) {
                    data.metrics = metrics.split("\r\n");
                    // ersten Eintrag loeschen, dieser hat keinen Inhalt.
                    data.metrics.splice(0, 1);
                  }
                case 4:
                  data.fittinginfo = description.values[3].replace(/\r\n/g, "<br>");
                case 3:
                  data.quality = description.values[2].replace(/\r\n/g, "");
                case 2:
                  data.description = description.values[1].replace(/\r\n/g, "<br>");
                case 1:
                  data.applications = description.values[0].split("\r\n");//.replace(/\r/g, "").replace(/\n/g, "");
                  // letzten Eintrag loeschen, dieser hat keinen Inhalt.
                  data.applications.splice(data.applications.length-1, data.applications.length-1);
                  delete data.DESCRIPTION;
              }
              return data;
            },
            /*
             * Transformiert das Request-Ergebniss in ein besser behandelbares Format 
             */
            transform_result_data: function (data) {
              data = heritage.manual.catalog.product.info.split_description_data (data.DATA);
              data.sku = data.ITEMNUMBER[0];
              // if(data.sku.charAt(data.sku.length-1)=="/")
              //   data.sku = data.sku.substring(0,data.sku.length-1);
              data.itemname = data.ITEMNAME[0];
              data.weight = data.WEIGHT[0];
              data.FREESTOCKQUANTITY = data.FREESTOCKQUANTITY[0];
              data.SPECIALORDER = data.SPECIALORDER[0];
              data.COSTPRICE = data.COSTPRICE[0];
              data.RETAILPRICE = data.RETAILPRICE[0];
              data.PRICE2 = data.PRICE2[0];
              data.PRICE3 = data.PRICE3[0];
              data.PRICE4 = data.PRICE4[0];
              data.DUEWEEKS = data.DUEWEEKS[0];
              delete data.WEIGHT;
              delete data.ITEMNAME;
              delete data.ITEMNUMBER;
              return data;
            }
          },
          list: {
            url: function (cb) {
              var url_string = config.host + config.partnums_path;
              url_string = url.setParameterUrl(url_string, config.login, config.pass);
              url_string = encodeURIComponent(url_string);
              if(cb != null) cb(url_string);
              else return url_string;
            },
            /*
             * Transformiert das Request-Ergebniss in ein besser behandelbares Format 
             */
            transform_result_data: function (data) {
              return data.DATA;
            }
          }
        }
      }
    },
    get_date: function () {
      var now = new Date(); 
      var d = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      var curr_date = d.get_date();
      var curr_month = d.getMonth();
      curr_month++;
      var curr_year = d.getFullYear();
      return curr_month + "/" + curr_date + "/" + curr_year;
    },

    get_time: function () {
      var a_p = "";
      var now = new Date(); 
      var d = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      var curr_hour = d.getHours();
      if (curr_hour < 12) {
        a_p = "AM";
      }
      else {
        a_p = "PM";
      }
      if (curr_hour == 0) {
        curr_hour = 12;
      }
      if (curr_hour > 12) {
        curr_hour = curr_hour - 12;
      }

      var curr_min = d.getMinutes();

      curr_min = curr_min + "";

      if (curr_min.length == 1) {
      curr_min = "0" + curr_min;
      }

      return curr_hour + ":" + curr_min + " " + a_p;
    },

    round_price: function (x) {
      var k = (Math.round(x * 100) / 100).toString();
      k += (k.indexOf('.') == -1)? '.00' : '00';
      return Number(k.substring(0, k.indexOf('.') + 3));
    },
    auto: {
      catalog: {
        product: {
          _infos: function (url_string, cb) {
            url_string = decodeURIComponent(url_string);
            heritage.manual.get_json(url_string, function(data) {
              if(data != null) {
                delete data.COLUMNS;
                if(typeof cb != 'undefined')
                  cb(data);
                else
                  return data;
              } else {
                //error.e408(req, res); TODO
              }
            });
          },         
          info: function (sku, cb) {
            heritage.auto.catalog.product._infos(heritage.manual.catalog.product.info.url(sku, null), function(data){
              data = heritage.manual.catalog.product.info.transform_result_data(data);
              cb(data);
            });
          },
          list: function (cb) {
            var url_string = decodeURIComponent(heritage.manual.catalog.product.list.url(null));
            heritage.manual.get_json(url_string, function(data) {
              cb(heritage.manual.catalog.product.list.transform_result_data(data));
            });
          }
        }
      }
    }
  }

  return heritage; 
}