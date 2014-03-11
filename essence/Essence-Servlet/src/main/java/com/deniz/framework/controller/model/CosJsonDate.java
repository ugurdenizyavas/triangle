package com.deniz.framework.controller.model;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonFormatEnum;
import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonDate extends CosJsonObject {

	public CosJsonDate(String dateId) throws JSONException {
		super(dateId);
		this.setType(CosJsonTypeEnum.time).setFormat(CosJsonFormatEnum.date);
	}
}
