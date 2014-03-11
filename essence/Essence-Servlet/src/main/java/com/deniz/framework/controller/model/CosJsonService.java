package com.deniz.framework.controller.model;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonTriggerEnum;

public class CosJsonService extends CosJsonObject {

	public CosJsonService(String objectId) throws JSONException {
		super(objectId);
		this.setParameters(new CosJsonArray<CosJsonParameter>());
	}

	public CosJsonService setParameters(CosJsonArray<CosJsonParameter> parametersArray) throws JSONException {
		return (CosJsonService) put("parameters", parametersArray);
	}

	public CosJsonService setTrigger(CosJsonTriggerEnum trigger) throws JSONException {
		return (CosJsonService) put("trigger", trigger.name());
	}

	public CosJsonService setUrl(String url) throws JSONException {
		return (CosJsonService) put("url", url);
	}
}
