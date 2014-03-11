package com.deniz.framework.configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.core.io.Resource;

/**
 * <p/>
 * Extends the PropertyPlaceholderConfigurer and collects the final propertys for later logging through ApplicationConfigurationLogger.
 * 
 * </p>
 * @author Deniz Yavas
 */
public class LoggingPropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer
{


	private Map<String, String> configurationProperties = new HashMap<String, String>();
	private List<String> propertyFilenames = new ArrayList<String>();


	@Override
	protected String resolvePlaceholder( String placeholder, Properties props )
	{
		String finalValue = super.resolvePlaceholder( placeholder, props );

		configurationProperties.put( placeholder, finalValue );
		return finalValue;
	}


	public void setConfigurationProperties( Map<String, String> configurationProperties )
	{
		this.configurationProperties = configurationProperties;
	}

	public Map<String, String> getConfigurationProperties()
	{
		return configurationProperties;
	}

	@Override
	public void setLocations( Resource[] locations )
	{
		super.setLocations( locations );
		for ( Resource location : locations )
		{
			propertyFilenames.add( location.getFilename() );
		}
	}

	public List<String> getPropertyFilenames()
	{
		return propertyFilenames;
	}
}

