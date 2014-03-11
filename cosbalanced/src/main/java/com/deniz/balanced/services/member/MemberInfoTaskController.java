package com.deniz.balanced.services.member;

import com.deniz.framework.controller.TaskControllerTemplate;
import com.deniz.framework.controller.model.*;
import com.deniz.framework.dto.Message;
import org.json.JSONException;

import javax.servlet.http.HttpServletRequest;

public class MemberInfoTaskController extends TaskControllerTemplate {

	@Override
	public CosJsonFundamental init(HttpServletRequest request) throws JSONException {
		CosJsonArray<CosJsonObject> items = new CosJsonArray<CosJsonObject>();
		CosJsonText flightNoText = new CosJsonText("simpleName", "Deniz");
		items.put(flightNoText);

		CosJsonArray<CosJsonObject> services = new CosJsonArray<CosJsonObject>();
		services.put(new CosJsonService("back").setUrl("member/details/update"));

		return new CosJsonFundamental(items, services);
	}

	public CosJsonFundamental update(HttpServletRequest request) throws JSONException {
		CosJsonArray<CosJsonObject> items = new CosJsonArray<CosJsonObject>();
		CosJsonText flightNoText = new CosJsonText("simpleName", "Yucel");
		flightNoText.addError(new Message("validation-error"));
		items.put(flightNoText);

		return new CosJsonFundamental(items, null);
	}
}
