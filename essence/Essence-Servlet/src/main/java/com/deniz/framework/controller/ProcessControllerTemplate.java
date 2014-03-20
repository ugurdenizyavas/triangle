package com.deniz.framework.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;
import org.springframework.web.servlet.mvc.multiaction.NoSuchRequestHandlingMethodException;

import com.deniz.framework.controller.model.CosJsonArray;
import com.deniz.framework.controller.model.CosJsonFundamental;
import com.deniz.framework.controller.model.CosJsonObject;
import com.deniz.framework.controller.model.CosJsonProcess;
import com.deniz.framework.controller.model.CosJsonTask;
import com.deniz.framework.controller.utils.CosJsonHelper;


public abstract class ProcessControllerTemplate extends MultiActionController
{

	private Map<String, TaskControllerTemplate> taskControllers;

	protected String processId;

	@Required
	public void setProcessId( String processId )
	{
		this.processId = processId;
	}

	public void setTaskControllers( Map<String, TaskControllerTemplate> taskControllers )
	{
		this.taskControllers = taskControllers;
	}

	public String getFirstTaskControllerUrl( boolean isProcessInit, String pathInfo )
	{
		if ( isProcessInit )
		{
			Set<Entry<String, Boolean>> entrySet = getLockMap().entrySet();
			Entry<String, Boolean> firstController = entrySet.iterator().next();
			return firstController.getKey();
		}
		else
		{
			return pathInfo;
		}
	}

	/**
	 * Callback method that has to be provided by all subclasses in order to
	 * state which tasks are locked.
	 * 
	 * @return A LinkedHashMap is used so that the map reflects the order of the
	 *         tasks as displayed to the user. This is important as in case of
	 *         previous/next services, this map is evaluated to calculate the
	 *         next task to present to the user.
	 */
	public abstract LinkedHashMap<String, Boolean> getLockMap();

	/**
	 * Spring MVC callback. Spring calls this method when the controller does
	 * not have a corresponding method for the requested method.
	 * <p/>
	 * Example:<br/>
	 * A request to "/passengerreport.assistent/header/save" will first hit this process controller. Because Spring MVC cannot
	 * find a "save" method it will call handleNoSuchRequestHandlingMethod.
	 * <p/>
	 * Drawbacks:<br/>
	 * Using this approach has one disadvantage: If a taskController implements a method calles init, next or previous the
	 * requests to these methods first hit the init, next and previous methods of the processController and we have to use an
	 * manual dispatch to the taskController
	 */
	@Override
	final protected ModelAndView handleNoSuchRequestHandlingMethod( NoSuchRequestHandlingMethodException ex, HttpServletRequest request, HttpServletResponse response ) throws Exception
	{
		return handleCall( request, response, false );
	}

	/**
	 * The classical process init called by the web-client.
	 */
	final public ModelAndView init( HttpServletRequest request, HttpServletResponse response )
	{
		String controllerUrl = getControllerUrl( request.getPathInfo() );

		// If controller url is empty; that is a process init
		if ( StringUtils.isEmpty( controllerUrl ) )
		{
			return handleCall( request, response, true );
		}
		// If controller url is not empty; that is an init call but not a
		// process init
		else
		{
			return handleCall( request, response, false );
		}
	}

	private ModelAndView handleCall( HttpServletRequest request, HttpServletResponse response, boolean isProcessInit )
	{
		try
		{
			formJsonAsResponse( response, formProcessJson( request, isProcessInit ) );
		}
		catch ( JSONException e )
		{
			throw new RuntimeException( "problem with the json formation" );
		}
		return null;
	}

	private CosJsonProcess formProcessJson( HttpServletRequest request, boolean isProcessInit ) throws JSONException
	{
		CosJsonProcess processJson = CosJsonHelper.createProcess( processId, isProcessInit );
		processJson.setUrl( getRefreshUrl( request.getPathInfo() ) );
		CosJsonArray<CosJsonObject> taskItemsJson = formTasks( request, isProcessInit );
		return (CosJsonProcess) processJson.put( "items", taskItemsJson );
	}

	private CosJsonArray<CosJsonObject> formTasks( HttpServletRequest request, boolean isProcessInit ) throws JSONException
	{
		CosJsonArray<CosJsonObject> taskJsons = new CosJsonArray<CosJsonObject>();
		if ( isProcessInit )
		{
			for ( Entry<String, Boolean> taskAndLock : getLockMap().entrySet() )
			{
				String taskControllerUrl = taskAndLock.getKey();
				Boolean lock = taskAndLock.getValue();

				formTask( request, taskJsons, taskControllerUrl, lock, isProcessInit );
			}
		}
		else
		{
			formTask( request, taskJsons, getControllerUrl( request.getPathInfo() ), false, isProcessInit );
		}
		return taskJsons;
	}

	private void formTask( HttpServletRequest request, CosJsonArray<CosJsonObject> taskJsons, String taskControllerUrl, Boolean lock, boolean isProcessInit ) throws JSONException
	{
		String taskToProcess = formTaskToProcess( request.getPathInfo(), isProcessInit );

		CosJsonTask taskCosJson = CosJsonHelper.updateTask( taskControllerUrl );
		CosJsonHelper.lockUnlock( taskCosJson, lock );
		if ( taskControllerUrl.equals( taskToProcess ) )
		{
			TaskControllerTemplate currentTaskController = taskControllers.get( taskToProcess );
			taskCosJson = createCurrentTask( request, currentTaskController, taskCosJson, getCallerMethod( request.getPathInfo() ) );
		}
		taskJsons.put( taskCosJson );
	}

	private String getCallerMethod( String pathInfo )
	{
		return StringUtils.substringAfterLast( pathInfo, "/" );
	}

	private CosJsonTask createCurrentTask( HttpServletRequest request, TaskControllerTemplate currentTaskController, CosJsonTask taskCosJson, String callerMethod ) throws JSONException
	{
		CosJsonFundamental itemsAndServices = process( request, currentTaskController, callerMethod );
		if ( StringUtils.equals( callerMethod, "init" ) )
		{
			taskCosJson.init();
		}
		taskCosJson.put( "items", getTaskFundamental( itemsAndServices, "items" ) );
		taskCosJson.put( "services", getTaskFundamental( itemsAndServices, "services" ) );
		taskCosJson.put( "selected", true );
		return taskCosJson;
	}

	private JSONArray getTaskFundamental( CosJsonObject itemsAndServices, String items )
	{
		try
		{
			return itemsAndServices.getJSONArray( items );
		}
		catch ( JSONException e )
		{
			return null;
		}
	}

	/**
	 * Takes first task if process is initializing; else gets from request
	 * 
	 * @param pathInfo
	 * @param isProcessInit
	 * @return
	 */
	private String formTaskToProcess( String pathInfo, boolean isProcessInit )
	{
		String taskToProcess = "";
		if ( isProcessInit )
		{
			taskToProcess = getFirstTaskControllerUrl( isProcessInit, pathInfo );
		}
		else
		{
			taskToProcess = getControllerUrl( pathInfo );
		}
		return taskToProcess;
	}

	private void formJsonAsResponse( HttpServletResponse response, CosJsonProcess processJson )
	{
		PrintWriter out = setWriterAsResponse( response );

		out.write( CosJsonHelper.prettyJson( processJson ) );
		out.flush();
	}

	private PrintWriter setWriterAsResponse( HttpServletResponse response )
	{
		response.setContentType( "application/json" );
		PrintWriter out = null;
		try
		{
			out = response.getWriter();
		}
		catch ( IOException e )
		{
			e.printStackTrace();
		}
		return out;
	}

	/**
	 * Gets refresh url from pathInfo by removing "/" at the start
	 * 
	 * @param pathInfo
	 *            "/actualFlight/init"
	 * @return "actualFlight/init"
	 */
	private String getRefreshUrl( String pathInfo )
	{
		return StringUtils.removeStart( pathInfo, "/" );
	}

	private CosJsonFundamental process( HttpServletRequest request, TaskControllerTemplate currentTaskController, String callerMethod )
	{

		if ( currentTaskController != null )
		{
			CosJsonFundamental itemsAndServices;
			try
			{
				itemsAndServices = (CosJsonFundamental) currentTaskController.getClass().getMethod( callerMethod, HttpServletRequest.class )
						.invoke( currentTaskController, request );
				return itemsAndServices;
			}
			catch ( IllegalArgumentException e )
			{
				throw new RuntimeException( "wrong arguments for " + currentTaskController );
			}
			catch ( SecurityException e )
			{
				throw new RuntimeException( "security exception for " + currentTaskController );
			}
			catch ( IllegalAccessException e )
			{
				throw new RuntimeException( "illegal access for " + currentTaskController );
			}
			catch ( InvocationTargetException e )
			{
				e.printStackTrace();
				return new CosJsonFundamental();
			}
			catch ( NoSuchMethodException e )
			{
				throw new RuntimeException( "method cannot be found in " + currentTaskController );
			}
		}
		else
		{
			throw new RuntimeException( "no task" );
		}

	}

	/**
	 * Returns the url of the controller for a given requestPath.
	 * 
	 * @param requestPath
	 *            "/passengerreport.assistent/header/save"
	 * @return "header"
	 */
	final protected String getControllerUrl( String requestPath )
	{
		int lastSlash = requestPath.lastIndexOf( "/" );
		// Below is with process id as well "/passengerreport.assistent/header"
		String dirtyControllerUrlWithProcess = requestPath.substring( 0, lastSlash );
		String dirtyControllerUrl = StringUtils.remove( dirtyControllerUrlWithProcess, processId );
		return StringUtils.remove( dirtyControllerUrl, "/" );
	}

}
