package com.deniz.framework.controller.model;

import org.json.JSONArray;


public class CosJsonStringArray extends JSONArray{

	public CosJsonStringArray() {
	}
	
	public CosJsonStringArray(String... rows) {
		for (String row : rows) {
			this.put(row);
		}
	}
}
