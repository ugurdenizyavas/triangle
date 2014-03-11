package com.deniz.framework.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.framework.dto.converter.business.ObjectConverterService;


public abstract class BusinessTemplate
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );

	protected ObjectConverterService objectConverterService;

	public void setObjectConverterService( ObjectConverterService objectConverterService )
	{
		this.objectConverterService = objectConverterService;
	}


}
