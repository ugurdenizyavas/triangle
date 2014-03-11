package com.deniz.framework.controller.model;

import org.json.JSONException;

public class CosJsonListItem extends CosJsonObject{

	public CosJsonListItem(String value, String label) throws JSONException{
		super();
		this.setValue(value).setLabel(label);
	}
}
