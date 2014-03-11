package com.deniz.framework.controller.model;

import java.util.List;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonCheckedEnum;
import com.deniz.framework.controller.enums.CosJsonTypeEnum;


public class CosJsonTable extends CosJsonObject {

	public CosJsonTable(String objectId) throws JSONException {
		super(objectId);
		((CosJsonTable) this.setType(CosJsonTypeEnum.table).init()).setChecked(CosJsonCheckedEnum.multiple);
		this.put("columns", new CosJsonArray<CosJsonObject>().put(new CosJsonColumn("keyId", CosJsonTypeEnum.key).hide()));
		this.put("rows", new CosJsonArray<CosJsonObject>());
		this.put("services", new CosJsonArray<CosJsonObject>());
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public CosJsonTable(String objectId, List<CosJsonColumn> columns, List<CosJsonRow> rows, List<CosJsonService> services) throws JSONException {
		this(objectId);
		((CosJsonArray<CosJsonColumn>) this.getJSONArray("columns")).addObjects(columns);
		((CosJsonArray) this.getJSONArray("rows")).addArrays(rows);
		((CosJsonArray<CosJsonService>) this.getJSONArray("services")).addObjects(services);
	}

	public CosJsonTable setChecked(CosJsonCheckedEnum checkedEnum) throws JSONException {
		return (CosJsonTable) this.put("checked", checkedEnum.name());
	}
}
