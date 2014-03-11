/*
 File: news.js
 Purpose: Show news delivered by the content management system

	$Author: udy $
 */

(function() {
	// ----------------------------------------------------------------------------------------------
	// //
	// Vocabulary
	// ----------------------------------------------------------------------------------------------
	// //

	var Class = {
		isNews : 'isNews',
		rubric : 'rubric',
		date : 'date',
		text : 'text',
		link : 'more',
		done : 'done'
	};
	var COS = {
		news : 'news'
	};
	var my = {
		name : 'news'
	};

	// ----------------------------------------------------------------------------------------------
	// //
	// Class
	// ----------------------------------------------------------------------------------------------
	// //

	module({
		ns : 'id.gui',
		definition : function() {
			classify({
				name : 'News',
				definition : function() {
					def({
						name : 'initialize',
						method : function initialize(name) {
							id.object.register(this, {
								name : name,
								docType : Class.isNews,
								cosType : COS.news
							/* DEPRECATED */});
						}
					});

					def({
						name : 'init',
						method : function init(obj) {
							var cache = '';

							if (obj.items && obj.items.length != 0) {
								cache += '<h2>' + obj.label + '</h2>';

								$
										.each(
												obj.items,
												function() {
													if (this.rubric)
														cache += '<p class="'
																+ Class.rubric
																+ '">'
																+ this.rubric
																+ '</p>';
													if (this.headline)
														cache += '<h3>'
																+ this.headline
																+ '</h3>';

													cache += '<p class="'
															+ Class.text + '">';

													if (this.date)
														cache += '<span class="'
																+ Class.date
																+ '">'
																+ this.date
																+ '</span>';
													if (this.text)
														cache += '<span class="'
																+ Class.text
																+ '">'
																+ this.text
																		.nl2br()
																+ '</span>';

													if (this.link) {
														cache += '<span class="'
																+ Class.link
																+ '">';
														cache += '<a href="'
																+ (this.link.url ? this.link.url
																		: this.link)
																+ '">'
																+ (this.link.label ? this.link.label
																		: this.link)
																+ '</a></span>';
													}

													cache += '</p>';
												});

								obj.getPlace().html(cache).addClass(Class.done);
							}
						}
					});

					def({
						name : 'update',
						method : function update(obj) {
							this.init(obj);
						}
					});
				}
			});
		}
	});

	// ----------------------------------------------------------------------------------------------
	// //
	// Static Renderer
	// ----------------------------------------------------------------------------------------------
	// //

	id.gui.news = new id.gui.News(my.name);

}());