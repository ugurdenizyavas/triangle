package com.deniz.framework.configuration;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

/**
 * <p/>
 * Extends the PropertyPlaceholderConfigurer and collects the final propertys for later logging through ApplicationConfigurationLogger.
 * <p/>
 * </p>
 *
 * @author Deniz Yavas
 */
public class LoggingPropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer {

    private Map<String, String> configurationProperties = new HashMap<String, String>();
    private List<String> propertyFilenames = new ArrayList<String>();


    @Override
    protected String resolvePlaceholder(String placeholder, Properties props) {
        String finalValue = super.resolvePlaceholder(placeholder, props);

        configurationProperties.put(placeholder, finalValue);
        return finalValue;
    }


    public void setConfigurationProperties(Map<String, String> configurationProperties) {
        this.configurationProperties = configurationProperties;
    }

    public Map<String, String> getConfigurationProperties() {
        return configurationProperties;
    }

    @Override
    public void setLocations(Resource[] locations) {
        String stage = System.getProperty("app.configuration.stage");
        if (StringUtils.isEmpty(stage)) {
            Resource resource = new ClassPathResource("configuration/stages/");
            try {
                File file = resource.getFile();
                File[] listOfFiles = file.listFiles();
                String propertyFile = listOfFiles[0].getName();
                logger.info("app.configuration.stage runtime arguments is null, " +
                        "so app is using " + propertyFile + " for configuration");
                propertyFilenames.add(propertyFile);
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            Resource stageConfiguration = new ClassPathResource("configuration/stages/app." + stage + ".properties");
            propertyFilenames.add(stageConfiguration.getFilename());
        }
        super.setLocations(locations);
        for (Resource location : locations) {
            propertyFilenames.add(location.getFilename());
        }
    }

    public List<String> getPropertyFilenames() {
        return propertyFilenames;
    }
}

