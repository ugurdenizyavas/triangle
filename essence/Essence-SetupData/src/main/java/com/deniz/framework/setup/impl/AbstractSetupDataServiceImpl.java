package com.deniz.framework.setup.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;


public abstract class AbstractSetupDataServiceImpl implements ApplicationListener<ContextRefreshedEvent>
{
	protected final Logger logger = LoggerFactory.getLogger( getClass() );

	protected final String SETUP_DATA = "SETUP-DATA: ";

	private boolean setupDataEnabled;

	public void setSetupDataEnabled( boolean setupDataEnabled )
	{
		this.setupDataEnabled = setupDataEnabled;
	}

	public void onApplicationEvent( ContextRefreshedEvent event )
	{
		if ( event.getApplicationContext().getParent() == null ) // otherwise data is added twice
		{
			if ( !setupDataEnabled )
			{
				logger.info( SETUP_DATA + "SetupTestDataService is disabled, SetupData will not be created." );
				return;
			}
			else
			{
				insertData();
			}
		}
	}

	public abstract void insertData();


}
