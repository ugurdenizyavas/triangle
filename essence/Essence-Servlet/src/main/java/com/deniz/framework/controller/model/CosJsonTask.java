package com.deniz.framework.controller.model;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonTask extends CosJsonObject{

	public CosJsonTask(String taskId) throws JSONException{
		super(taskId);
		this.put("type", CosJsonTypeEnum.task);
	}
	
}
