package com.deniz.framework.controller.model;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonProcess extends CosJsonObject {

	public CosJsonProcess(String processId) throws JSONException {
		super(processId);
		this.put("type", CosJsonTypeEnum.process);
	}

	public CosJsonProcess setUrl(String url) throws JSONException{
		return (CosJsonProcess) put("url", url);
	}
}
