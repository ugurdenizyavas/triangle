package com.deniz.balanced.services.member;

import com.deniz.balanced.mission.business.MissionBusinessService;
import com.deniz.balanced.mission.business.domain.MissionDto;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.controller.TaskControllerTemplate;
import com.deniz.framework.controller.enums.CosJsonTriggerEnum;
import com.deniz.framework.controller.model.*;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Required;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

public class MemberOverviewTaskController extends TaskControllerTemplate {

    private UserBusinessService userBusinessService;
    private MissionBusinessService missionBusinessService;

    public void setMissionBusinessService(MissionBusinessService missionBusinessService) {
        this.missionBusinessService = missionBusinessService;
    }

    @Required
    public void setUserBusinessService(UserBusinessService userBusinessService) {
        this.userBusinessService = userBusinessService;
    }

    @Override
    public CosJsonFundamental init(HttpServletRequest request) throws JSONException {

        logger.info("here");
        MissionDto missionDto = new MissionDto();
        missionDto.getSimpleNameMeta().setValue("missione");
        try {
            logger.info("hereagain");
            missionBusinessService.addMission(missionDto);
        } catch (DataAlreadyExistException e) {
            logger.info("nowhere");
            logger.info(e.getMessage());
            e.printStackTrace();
        }
        logger.info("nowhereeeee");
        CosJsonArray<CosJsonObject> items = new CosJsonArray<CosJsonObject>();

        createFilters(items);

        createTable(items);

        CosJsonArray<CosJsonObject> services = new CosJsonArray<CosJsonObject>();
        services.put(new CosJsonService("search").setUrl("member/overview/search").setLabel("Search"));
        services.put(new CosJsonService("add").setUrl("member/details/init").setLabel("Add"));

        return new CosJsonFundamental(items, services);
    }

    public CosJsonObject update(HttpServletRequest request) throws JSONException {

        CosJsonObject itemsAndServices = new CosJsonObject();

        CosJsonArray<CosJsonObject> taskItems = new CosJsonArray<CosJsonObject>();

        createFilters(taskItems);

        createTable(taskItems);

        itemsAndServices.put("items", taskItems);

        return itemsAndServices;
    }

    private void createTable(CosJsonArray<CosJsonObject> taskItems) throws JSONException {
        List<CosJsonColumn> columns = createTableColumns();

        List<CosJsonRow> rows = createTableRows();

        List<CosJsonService> services = createTableServices();

        CosJsonTable groupsTable = new CosJsonTable("groupsTable", columns, rows, services);

        taskItems.put(groupsTable);
    }

    private List<CosJsonService> createTableServices() throws JSONException {
        List<CosJsonService> services = new ArrayList<CosJsonService>();

        CosJsonArray<CosJsonParameter> parameters = new CosJsonArray<CosJsonParameter>().addObjects(new CosJsonParameter("*"));

        services.add(new CosJsonService("edit").setTrigger(CosJsonTriggerEnum.select).setUrl("member/details/init").setParameters(parameters));
        return services;
    }

    private List<CosJsonRow> createTableRows() {
        List<CosJsonRow> rows = new ArrayList<CosJsonRow>();
        // TODO: Mock test user
        List<UserDto> memberDtoList = new ArrayList<UserDto>();
        try {
            memberDtoList = this.userBusinessService.getAncestors("deniz");
        } catch (NotValidIdException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (DataNotExistException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        for (UserDto memberDto : memberDtoList) {
            int i = (int) Math.random() % 20;

            rows.add(new CosJsonRow(i + "", memberDto.getSimpleNameMeta().getValue(), memberDto.getReferenceMeta().getValue(), memberDto.getBalanceMeta()
                    .getValue()));
        }
        return rows;
    }

    private List<CosJsonColumn> createTableColumns() throws JSONException {
        List<CosJsonColumn> columns = new ArrayList<CosJsonColumn>();
        columns.add(new CosJsonColumn("name", "Name"));
        columns.add(new CosJsonColumn("reference", "Reference"));
        columns.add(new CosJsonColumn("balance", "Balance"));
        return columns;
    }

    private void createFilters(CosJsonArray<CosJsonObject> taskItems) throws JSONException {
        CosJsonDate filterDate = createDateFilter();

        // CosJsonList filterMemberList = createMemberFilter();
        // taskItems.put(filterMemberList);
        taskItems.put(filterDate);
    }

    private CosJsonDate createDateFilter() throws JSONException {
        return (CosJsonDate) new CosJsonDate("date").setValue("19.04.2013");
    }

    private CosJsonList createMemberFilter() throws JSONException {
        List<CosJsonObject> listItems = new ArrayList<CosJsonObject>();
        // TODO: Mock test user
        List<UserDto> memberDtoList = new ArrayList<UserDto>();
        try {
            memberDtoList = this.userBusinessService.getAncestors("deniz");
        } catch (NotValidIdException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (DataNotExistException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        for (UserDto memberDto : memberDtoList) {
            listItems.add(new CosJsonListItem(memberDto.getSimpleNameMeta().getValue(), memberDto.getReferenceMeta().getValue()));
        }
        CosJsonList filterMemberList = new CosJsonList("memberList", listItems);
        return filterMemberList;
    }

}
