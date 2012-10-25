// sublime: tab_size 2; translate_tabs_to_spaces true

var url = require('./url.js');
var fetchUrl = require("fetch").fetchUrl; //https://github.com/andris9/fetch

module.exports = function(config) {

  return heritage = {

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

    get_product_url: function (sku, cb) {
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

    get_partnums_url: function (cb) {
      var url_string = config.host + config.partnums_path;
      url_string = encodeURIComponent(url_string);
      if(typeof cb != 'undefined')
        cb(url_string);
      else
        return url_string;
    },

    split_description_data: function (data) {
      var description = {};
      description.values = data.DESCRIPTION.toString().split('$');
      //description.names = new Array(description.values.length);

      switch (description.values.length) {
        case 5:
          data.Metrics = description.values[4];
        case 4:
          data.FittingInfo = description.values[3];
        case 3:
          data.Quality = description.values[2];
        case 2:
          data.Description = description.values[1];
          delete data.DESCRIPTION;
        case 1:
          data.Applications = description.values[0];
      }
      return data;
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

    _get_products: function (url_string, cb) {
      url_string = decodeURIComponent(url_string);
      this.get_json(url_string, function(data) {
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
    
    get_product: function (sku, cb) {
      heritage._get_products(this.get_product_url(sku, null), function(data){
        data.DATA = heritage.split_description_data(data.DATA);
        cb(data);
      });
    }
  }
}