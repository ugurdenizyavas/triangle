package com.deniz.framework.configuration;

import java.io.File;
import java.io.IOException;
import java.util.*;

import org.apache.commons.lang.ArrayUtils;
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
            try {
                Resource resource = new ClassPathResource("configuration/stages/");
                File file = resource.getFile();
                File[] listOfFiles = file.listFiles();
                stage = listOfFiles[0].getName();
                logger.info("app.configuration.stage runtime arguments is null, " +
                        "so app is using " + stage + " for configuration");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        Resource stageConfiguration = new ClassPathResource("configuration/stages/app." + stage + ".properties");
        propertyFilenames.add(stageConfiguration.getFilename());
        locations = (Resource[]) ArrayUtils.add(locations, stageConfiguration);

        for (Resource location : locations) {
            propertyFilenames.add(location.getFilename());
        }
        super.setLocations(locations);
    }

    public List<String> getPropertyFilenames() {
        return propertyFilenames;
    }

}

