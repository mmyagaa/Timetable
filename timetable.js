/**
* @author ENDiGo
*/

;(function($, window, document, undefined){
    var pluginName = 'timetable',
        defaults = {
            interval : 30,
            startHour : '8:30',
            endHour : '16:00',
            daysName : ['Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба','Ням'],
	        daysMin : ['Да','Мя','Лх','Пү','Ба','Бя','Ня'],
            days: 7
        };
    
    function Plugin(element, options){
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.container = $(element).parent();
        
        this.init();
    }
    
    var timeStringToDate = function(string){
        var date = new Date(),
		hour = parseInt(string.split(':')[0]),
		min = parseInt(string.split(':')[1]);		
		date.setHours(hour, min, 0, 0);
		return date;
    };
    
    var dateToTimeString = function(date){
        var time = date.getHours(),minutes = date.getMinutes();
        
        time = time < 10? '0'+ time : time;
        minutes = minutes < 10? '0'+ minutes : minutes;
                    
        return [time,minutes].join(':');
    };    
    
    var addMinutes = function (date, minutes) {
        return new Date(date.getTime() + minutes*60000);
    }
    
    Plugin.prototype = {
        init: function(){
            var plugin = this,
                table = $('<table class="timetable"></table>');
            
            plugin._calcTimes(plugin.options);
            plugin._createHeader(table,plugin.options);
            plugin._initEvents(plugin.options);
            plugin._createBody(table,plugin.options);
            plugin._clearTable(table,plugin.options);
            this.container.append(table);  
            $(plugin.element).hide();
        },
        _createHeader: function($table,$options){
            var row = $('<tr></tr>'),
                head = $('<thead></thead>');
            
            row.append('<th></th>');	

            for (var i = 0; i < $options.days; i++)
            {
                var cell = $('<th></th>');
                cell.html(['<span class="uk-hidden-small">',$options.daysName[i],'</span>',
                           '<span class="uk-visible-small">',$options.daysMin[i],'</span>'].join(''));
                row.append(cell);
            }	
            row.appendTo(head);
            $table.append(head);
        },
        _createBody: function($table,$options){
            var $body = $('<tbody></tbody>');
            
            $.each($options.times, function(){
                var $row = $('<tr></tr>'),
                    time = this;
                    
                $row.append($('<td></td>').html(time.text));
                
                for (var i = 0; i < $options.days; i++)
                {
                    var cell = $('<td></td>');
                    
                    $.each($options.events,function(){
                        if(this.start == time.start && this.day == i)
                        {
                            cell.addClass('event')
                                .append($('<div class="event-container"></div>')
                                        .attr('data-uk-tooltip','{pos:top}')
                                        .attr('title',this.html)
                                        .html(this.html));
                            if(this.lenght > 1)
                                cell.attr('rowspan',this.lenght);
                        }
                    });
                    
                    $row.append(cell);
                }
                
                $body.append($row)
            });
            
            $table.append($body);
        },
        _clearTable :function($table){
            $.each($table.find('tbody tr td.event'),function(i){
                if($(this).attr('rowspan') && parseInt($(this).attr('rowspan')) > 1)
                {
                    var row = this.parentElement,
                        $tbody = $table.find('tbody'),
                        index = $tbody.find(row).index(),
                        rowSpan = parseInt($(this).attr('rowspan'));
                    
                    for(var i = index + 1;i<rowSpan;i++)
                    {
                        var tRow = $tbody.find('tr').get(i);
                        
                        $.each($(tRow).find('td'),function(){
                            if(!this.innerHTML && this.innerHTML == '')
                            {
                                $(this).remove();
                                return false;
                            }
                        })
                    }
                    
                }
            });
        },
        _calcTimes: function($options){
            var times = [],
                start = timeStringToDate($options.startHour),
                end = timeStringToDate($options.endHour),
                t = start,
                interval = $options.interval;
            
            while(end.getTime() > t.getTime()){
                var a = dateToTimeString(t);
                t = addMinutes(t, interval);
                var b = dateToTimeString(t);
                times.push({start : a, end : b, text : [a,b].join(' - ')});
            }
            
            $options.times = times;
        },
        _initEvents: function($options){
            var events = [];
            
            $.each($(this.element).find('li'),function(i){
                var event = {
                    day: $(this).data('day'),
                    start: $(this).data('start'),
                    lenght: $(this).data('lenght'),
                    html: $(this).html()
                };                
                
                events.push(event);                
            })
            
            $options.events = events;
        }
    };
    
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);


$(function(){
	$('.timetable-data').timetable();
});