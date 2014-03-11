<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE fo:root [	]>

<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"
         text-align="center"
         font-weight="normal"
         font-size="3.005mm"
         font-family="Helvetica">

<fo:layout-master-set>

	<fo:simple-page-master
		master-name="portrait"
		page-width="210mm" page-height="297mm"
		margin-top="15mm" margin-bottom="13.88mm"
		margin-left="20mm" margin-right="10mm">

        <fo:region-body region-name="pagebody"
            margin-top="40mm" margin-bottom="5mm"
            margin-left="0mm" margin-right="0mm"/>
        <fo:region-before region-name="pagehead" extent="5mm"/>
        <fo:region-after region-name="pagefoot" extent="5mm"/>

	</fo:simple-page-master>

	<fo:page-sequence-master master-name="master-sequence">
		<fo:repeatable-page-master-alternatives>
			<fo:conditional-page-master-reference master-reference="portrait"/>
		</fo:repeatable-page-master-alternatives>
	</fo:page-sequence-master>

</fo:layout-master-set>

<fo:page-sequence master-reference="portrait" font-size="4mm">

	<fo:static-content flow-name="pagehead">
		<#include "header/Header.ftl"/>
    </fo:static-content>

	<fo:static-content flow-name="pagefoot">
		<#include "footer/Footer.ftl"/>
	</fo:static-content>

   <fo:flow flow-name="pagebody">

	    <#--XXXXXXXXXXXXXXXXXXXXXXXXXXX   First Page Start   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-->
		<#include "chapter/ChapterFirstPage.ftl"/>
	    <#--XXXXXXXXXXXXXXXXXXXXXXXXXXX   First Page End     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-->

		<#--XXXXXXXXXXXXXXXXXXXXXXXXXXX   Chapter1 Start    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-->
        <#include "chapter/Chapter1AllUndefinedReports.ftl"/>
	    <#--XXXXXXXXXXXXXXXXXXXXXXXXXXX   Chapter1 End     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-->

        <fo:block id="last-page"></fo:block>

    </fo:flow>
</fo:page-sequence>

</fo:root>