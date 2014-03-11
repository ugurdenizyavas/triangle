package com.deniz.framework.controller.model;

import org.json.JSONException;


public class CosJsonFundamental extends CosJsonObject {

	public CosJsonFundamental() {

	}

	public CosJsonFundamental(CosJsonArray<CosJsonObject> items, CosJsonArray<CosJsonObject> services) throws JSONException {
		super();
		setItems(items);
		setServices(services);
	}

	public CosJsonObject setItems(CosJsonArray<CosJsonObject> items) throws JSONException {
		return put("items", items);
	}

	public CosJsonObject setServices(CosJsonArray<CosJsonObject> services) throws JSONException {
		return put("services", services);
	}
}
