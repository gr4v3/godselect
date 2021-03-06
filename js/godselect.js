if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}
window.previous_godselect = false;
var create_godelement = function(select) {
    if (!select) return false;
    var element = document.createElement('div');
        select.parentNode.replaceChild(element, select);
	element.name = select.name;
        element.className = 'godselect';
        element.visible = false;
        element.option_selected = false;
        element.changed = false;
        element.buffer = '';
        element.timeout = false;
        var onchange = select.attributes.getNamedItem('onchange');
        if (onchange) element.onchangestring = onchange.value; else element.onchangestring = false;
        element.options = new Array();
        var container = document.createElement('input');   
        var params = {};
        if (select.title.length === 0) {
            params.name = 'default';
            params.value = null;
            params.title = 'default';
        } else eval('params = ' + select.title);
            container.value = params.title;
            container.saved = params.value;
            container.type = 'text';
            container.className = 'container';
        element.appendChild(container);
        element.container = container;
        var input = document.createElement('input');
            input.value = params.value;
            input.type = 'hidden';
            input.name = params.name;
        element.appendChild(input);
        element.input = input;
        var options_container = document.createElement('ul');
        element.appendChild(options_container);    
        element.options_container = options_container;
        if (select.title.length > 0 ) {
            var option_item = document.createElement('li');
                option_item.title = '';
                option_item.innerHTML = params.title;
            element.options_container.appendChild(option_item);
        }
        $(select).find('option').each(function(i, option) {
            var option_item = document.createElement('li');
                option_item.title = option.value;
                option_item.innerHTML = option.text;
            element.options_container.appendChild(option_item);
        });
    return element;
};
var assign_godelement = function(element) {
    if (!element) return false;
    var element_cached = $(element);
    var element_container_cached = $(element.container);
    var options_container_cached = $($(element.options_container)[0]);
        options_container_cached.addClass('options');
    options_container_cached.find('li').each(function(i,option_element) {
        var option_element_cached = $(option_element);
        if (option_element.title.length > 0) { 
            var option_value = option_element.title;
            if (option_value === element.input.value) {
                element.container.value = option_element_cached.text();
                option_element_cached.addClass('selected');
                element.option_selected = option_element_cached;
            }
            option_element_cached.on('search', function() {
                if (element.buffer.length === 0) {
                    $(this).removeClass('selected');
                    return false;
                }
                var text = $(this).text();
                var result = text.search(element.buffer);
                if (result >= 0) {
                    element.option_selected = $(this);
                    element.option_selected.addClass('selected');
                    if (!element.visible) element_cached.trigger('open');
                    $(element).trigger('scrollit');
                } else $(this).removeClass('selected');
            });
            option_element_cached.on('clear', function() {
                if (this.title !== element.input.value) $(this).removeClass('selected');
            });
            option_element_cached.on('select_option', function() {
                element.option_selected.removeClass('selected');
                element.option_selected = $(this);
                element.option_selected.addClass('selected');
                element_cached.trigger('scrollit');
            });
        }
        option_element_cached.click(function(e) {
            e.stopPropagation();
            var text = $(this).text();
            var value_attribute = this.attributes.getNamedItem('value');
            if (value_attribute) text = value_attribute.value;
            var value = this.title;
            element.container.value = text;
            element.container.saved = text;
            $(element.option_selected).removeClass('selected');
            $(this).addClass('selected');
            element.input.value = value;
            element.buffer = text;
            this.name = element.name;
            element.option_selected = $(this);
            element.changed = true;
            eval(element.onchangestring);
            element_cached.trigger('close');
        });
    });
    element_cached.on('blur', function() {
        if ( ! element.changed) element_container_cached.trigger('blur');
    });
    element_cached.on('focus', function() {
        element_container_cached.trigger('focus');
    });
    element_container_cached.on('focus',function() {
        element_cached.removeClass('godselect-blur');
        element_cached.addClass('godselect-focus');
    });
    element_container_cached.on('blur',function() {
        element_cached.addClass('godselect-blur');
        element_cached.removeClass('godselect-focus');
    });
    element_cached.on('open', function() {
        if (window.previous_godselect) $(window.previous_godselect).trigger('close');
        window.previous_godselect = element;
        
        var border_bottom = parseInt(element_cached.css('border-bottom-width') || element_cached.css('border-width'));
        var padding_bottom = parseInt(element_cached.css('padding-bottom') || element_cached.css('padding'));
        var margin_bottom = parseInt(element_cached.css('margin-bottom') || element_cached.css('margin'));
        
        options_container_cached.css('margin-top', (border_bottom + padding_bottom + margin_bottom + 1));
        options_container_cached.css('margin-left', (0 - border_bottom - padding_bottom - margin_bottom));
        options_container_cached.addClass('visible');
        element.visible = true;
        $('.godselect').each(function(i, element_sibling) {
            if (element_sibling.input.value.length !== 0) $(element_sibling).trigger('focus');
            else $(element_sibling).trigger('blur');
        });
        element_cached.trigger('focus');
        element_cached.trigger('scrollit');
    });
    element_cached.on('close', function() {
        options_container_cached.removeClass('visible');
        options_container_cached.find('li').trigger('clear');
        element.visible = false;
        if (element.input.value.length === 0) element_cached.trigger('blur');
    });
    element_cached.on('scrollit', function() {
        var selected_option = element_cached.find('.selected');
        if (selected_option.length > 0) selected_option[0].scrollIntoViewIfNeeded(true);
    });
    element_cached.on('select', function() {
        var selected = options_container_cached.find('li.selected');
        if (selected) selected.trigger('click');
    });
    element_cached.on('up', function() {
        if (!element.option_selected) return false;
        var item = element.option_selected.prev();
        item.trigger('select_option');
    });
    element_cached.on('down', function() {
        if (!element.option_selected) return false;
        var item = element.option_selected.next();
        item.trigger('select_option');
    });
    element_cached.click(function() {
        if (! element.visible) element_cached.trigger('open'); 
        else if (element.visible) element_cached.trigger('close');
    });
    element_cached.mouseenter(function() {
        element.mousein = true;
        if (element.timeout) clearInterval(element.timeout);
    });
    element_cached.mouseleave(function() {
        element.mousein = false;
        element.timeout = setTimeout(function() {
            //element_cached.trigger('close');
        },3000);
    });
    if (!element.option_selected) $(element).trigger('blur');
};
var init_godelement = function(element) {
    var params = {};
    if (element.title.length === 0) {
        params.name = 'default';
        params.value = null;
        params.title = 'default';
    } else eval('params = ' + element.title);
    element.name = params.name;
    element.option_selected = false;
    element.changed = false;
    element.buffer = '';
    element.timeout = false;
    var onchange = element.attributes.getNamedItem('onchange');
    if (onchange) element.onchangestring = onchange.value; else element.onchangestring = false;
    var element_cached = $(element);
    element.options_container = element_cached.find('ul');
    var container = document.createElement('input');
        container.value = params.value;
        container.saved = '';
        container.type = 'text';
        container.className = 'container';
    element.insertBefore(container, element.options_container[0]);
    element.container = container;
    var input = document.createElement('input');
        input.value = params.value;
        input.type = 'hidden';
        input.name = params.name;
    element.appendChild(input);
    element.input = input;
    element.insertBefore(input, element.options_container[0]);
    return element;
};
$(document).ready(function() {
    $('div.godselect').each(function(index,element) {
        assign_godelement(init_godelement(element));
    });
    $('select').each(function(index,select) {
        assign_godelement(create_godelement(select));
    });
    $(document).click(function(e) {
        var parent = $(e.target).parent('div.godselect');
        if (parent.length === 0) {
            $('.godselect').trigger('close');
            $('.godselect').each(function(i, element){
                if (element.input.value.length !== 0) $(element).trigger('focus');
                else $(element).trigger('blur');
            });
        }
    });
   $(document).keydown(function(e) {
        var active = $(document).find('.godselect-focus');
        if (active && active[0]) {
            var element = active[0];
            switch (e.keyCode) {
                case 8:
                    element.buffer = element.container.value;
                    $(element.options_container).find('li').trigger('search');
                    break;
                case 27:
                    e.preventDefault();
                    break;
                case 38:
                    e.preventDefault();
                    $(element).trigger('up');
                    break;
                case 40:
                    e.preventDefault();
                    $(element).trigger('down');
                    break;
                default:
                    return true;
            }
            return true;
        }
    });
    $(document).keyup(function(e) {
        var active = $(document).find('.godselect-focus');
        if (active && active[0]) {
            var element = active[0];
            if (e.keyCode === 13) {
                 e.preventDefault();
                 $(element).trigger('select');
                 return false;
            } else if (e.keyCode !== 38 && e.keyCode !== 40) {
                element.buffer = element.container.value;
                $(element.options_container).find('li').trigger('search');
            }
        }
    });
    
});