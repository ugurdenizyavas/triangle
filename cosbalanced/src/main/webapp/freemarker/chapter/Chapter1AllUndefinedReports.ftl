<#-- @ftlvariable name="dto" type="aero.idgroup.workflowfactory.passengerreport.pdfExport_showcase.business.impl.pdf.domain.chapterAllUndefinedReports.PdfUndefinedReportDto"  -->
<fo:block break-before="page"></fo:block>

<fo:block><fo:leader/></fo:block>

    <@table2Cols lable="Title" value="${dto.titleMeta.value!'-'}" richText="false"/>

    <@table2Cols lable="State" value="${dto.stateMeta.value!'-'}" richText="false"/>

    <@table2Cols lable="Type" value="${dto.typeMeta.value!'-'}" richText="false"/>

    <@table2Cols lable="Title" value="${dto.descriptionMeta.value!'-'}" richText="false"/>

<#macro tableRow lable value richText>
<fo:table-row >
    <fo:table-cell text-align="left">
        <fo:block>${lable}:</fo:block>
    </fo:table-cell>
    <fo:table-cell text-align="left" padding-bottom="2mm">
	    <#if richText = "true">
	        <fo:block>${value}</fo:block>
	    <#else>
            <fo:block>${value}</fo:block>
	    </#if>
    </fo:table-cell>
</fo:table-row>
</#macro>

<#macro table2Cols lable value richText>
<fo:block>
    <fo:table table-layout="fixed" width="100%">
        <fo:table-column column-width="60mm" column-number="1"/>
        <fo:table-column column-width="100mm" column-number="2"/>
        <fo:table-body>
            <@tableRow lable=lable value=value richText=richText/>
        </fo:table-body>
    </fo:table>
</fo:block>
<fo:block space-after="1.5mm"></fo:block>
</#macro>