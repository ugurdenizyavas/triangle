package com.deniz.framework.controller.model;

import java.util.List;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonFormatEnum;
import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonList extends CosJsonObject {

	public CosJsonList(String objectId) throws JSONException {
		super(objectId);
		this.setType(CosJsonTypeEnum.list).setFormat(CosJsonFormatEnum.text).setItems(new CosJsonArray<CosJsonObject>().put(new CosJsonListItem("*", "Please Select")));
	}

	@SuppressWarnings("unchecked")
	public CosJsonList(String objectId, List<CosJsonObject> listItems) throws JSONException {
		this(objectId);
		((CosJsonArray<CosJsonObject>) this.getJSONArray("items")).addObjects(listItems);
	}
	
	

}
