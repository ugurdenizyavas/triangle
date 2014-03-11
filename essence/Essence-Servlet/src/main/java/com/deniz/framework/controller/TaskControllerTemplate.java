package com.deniz.framework.controller;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.springframework.beans.factory.annotation.Required;

import com.deniz.framework.controller.model.CosJsonFundamental;


public abstract class TaskControllerTemplate extends LoggingTaskControllerTemplate
{

	protected static final String JSON_RESPONSE = "jsonResponse";

	protected String processId;

	@Required
	public void setProcessId( String processId )
	{
		this.processId = processId;
	}

	public abstract CosJsonFundamental init( HttpServletRequest request ) throws JSONException;

}
