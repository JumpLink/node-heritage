function test_get_product(sku, cb) {
  json_shop.get_products(json_shop.parse_info_filter(sku, null), function(data){
    cb(sku, data);
  });
}
