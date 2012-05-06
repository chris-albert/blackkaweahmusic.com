/**
 * This is the base javascript library
 * @author creasetoph
 **/
(function() {
    window.creasetoph = {};
    var namespace = window.creasetoph;
    var C$ = {
        controller_name: 'controller',
        controller_object_name: 'controllerobject',
        form_name: 'form',
        link_name: 'link',
        controllers: [],
        forms: [],
        inherit: function(child,parent,singletons) {
            var self = function(){};
            self.class_name = child;
            self.parent_name = parent;
            self.singletons = singletons || [];
            self.do_inheritance = (parent === '')?false:true;
            namespace[child] = self;
            return self;
        },
        do_inheritance: function(object_name) {
            var this_object = this.find_object(object_name),
                this_parent = this.find_object(this_object.parent_name)
                ,new_parent,f;
            if(C$.is_array(this_object.parent_name)) {
                var tmp = this_object.parent_name,obj;
                for(var x in tmp) {
                    obj = this.find_object(object_name);
                    obj.parent_name = tmp[x];
                    obj.do_inheritance = true;
                    C$.do_inheritance(object_name);
                }
                obj = this.find_object(object_name);
                obj.parent_name = tmp;
                return;
            }
            if(this_parent.do_inheritance) {
                C$.do_inheritance(this_object.parent_name);
                this_parent = this.find_object(this_object.parent_name);
            }else {
                if(typeof this_parent.init === 'function') {
                    this_parent.init();
                }
            }
            if(this_object.do_inheritance) {
                new_parent = new this_parent();
                f = function(){};
                f.class_name = object_name;
                f.parent_name = this_object.parent_name;
                f.do_inheritance = false;
                f.prototype = new_parent;
                f.prototype.parent = {};
                
                //create copyies of any arrays in parent
                for(var i in f.prototype) {
                    if(typeof f.prototype[i] === 'object' && f.prototype[i] != null) {
                        if(f.prototype[i].length !== undefined) {
                            f.prototype[i] = f.prototype[i].slice(0);
                        }
                    }
                }
                for(var i in this_object.prototype) {
                    if(typeof f.prototype[i] !== 'undefined') {
                        f.prototype.parent[i] = f.prototype[i];
                        if(typeof f.prototype.parent[f.parent_name] === 'undefined') {
                            f.prototype.parent[f.parent_name] = {};
                        }
                        f.prototype.parent[f.parent_name][i] = f.prototype[i];
                    }
                    f.prototype[i] = this_object.prototype[i];
                }
                //Add objects to class
                //if(typeof f.prototype.Objects === 'object') {
                    //C$.foreach(f.prototype.Objects,function(prop,name) {
                        //var tmp = C$.find_object(name);
                        //console.log(name + ":" + tmp.do_inheritance);
                        //if(tmp.do_inheritance) {
                            //C$.do_inheritance(name);
                        //}
                        //f.prototype[prop] = tmp.prototype;
                    //});
                //}
                
                if(typeof f.prototype.parent_init === 'function') {
                    f.prototype.parent_init.call(f.prototype);
                }
                if(typeof f.prototype.init === 'function') {
                    
                    f.prototype.init.call(f.prototype);
                }
                for(var i in this_object.singletons) {
                    f[this_object.singletons[i]] = this_parent[this_object.singletons[i]];
                }
//                f.prototype.parent = this_parent;
                f.prototype.object = f;
                //this_object = f;
                this.replace_object(object_name,f);
            }else {
                //Add objects to class
                //if(typeof this_object.prototype.Objects === 'object') {
                    //C$.foreach(this_object.prototype.Objects,function(prop,name) {
                        //this_object.prototype[prop] = C$.find_object(name).prototype;
                    //});
                //}

                if(typeof this_object.prototype.init === 'function') {
                    this_object.prototype.init();
                }
            }
        },
        find_object : function(object) {
            if(namespace.hasOwnProperty(object)){
                if(namespace[object].do_inheritance) {
                    //C$.do_inheritance(object);
                }
                return namespace[object];
            }else {
                return false;
            }
        },
        replace_object : function(object,replacer) {
            namespace[object] = replacer;
        },
        clone_object: function(o) {
            var f = function(){};
            f.prototype = o;
            return new f;
        },
        clone_array_of_objects: function(a) {
            var new_arr = [];
            for(var i in a) {
                new_arr[i] = C$.clone_object(a[i]);
            }
            return new_arr;
        },
        extend_namespace: function(extend_object) {
            for(var i in extend_object) {
                if(extend_object.hasOwnProperty(i)) {
                    namespace[i] = extend_object[i];
                }
            }
        },
        extend_obj: function(orig_obj,new_obj) {
            for(var i in new_obj) {
                if(new_obj.hasOwnProperty(i)) {
                    orig_obj[i] = new_obj[i];
                }
            }
            return orig_obj;
        },
        foreach: function(obj,func,scope) {
            var ret = [];
            scope = scope || this;
			for(var key in obj) {
				if(obj.hasOwnProperty(key)) {
					ret.push(func.call(scope,key,obj[key]));
				}
			}
			return ret;
		},
        arguments_to_array: function(args) {
            if(args.legnth !== undefined) return;
            var arr = [];
            for(var l = args.length - 1; l >= 0; l--) {
                arr.unshift(args[l]);
            }
            return arr;
        },
        $: function(el, root, array) {
            array = array || false;
            if(typeof el === 'string') {
                var els = window.Sizzle(el,root);
                if(els.length > 1) {
                    for(var i in els) {
                        C$.extend_obj(els[i],C$.$functions);
                    }
                    return els;
                }else if(els.length === 1) {
                    if(!array) {
                        return C$.extend_obj(els[0],C$.$functions);
                    }else {
                        return [C$.extend_obj(els[0],C$.$functions)];
                    }
                }
            }else if(typeof el === 'object') {
                if(el.extended) {
                    return el;
                }
                return C$.extend_obj(el,C$.$functions);
            }else if(typeof el === 'undefined') {
                return {new_el: C$.$functions.new_el};
            }
        },
        $functions: {
            extended: true,
            css: function(args) {
                for(var i in args) {
                    if(args.hasOwnProperty(i)) {
                        if(this.hasOwnProperty(i)) {
                            this[i](args[i]);
                        }else {
                            //this should never get executed since we added all style functions to this
                            //just in case there is a wild style that was not on the body but on the element
                            this.style[i] = args[i];
                        }
                    }
                }
                return this;
            },
            opacity: function(value){
                this.style.opacity = value/10;
                this.style.MozOpacity = value/10;
                this.style.KhtmlOpacity = value/10;
                this.style.filter = 'alpha(opacity=' + value*10 + ')';
                return this;
            },
            add_styles: function() {
                var i;
                C$.styles = $('body').style;
                for(i in C$.styles) {
                    if(typeof C$.$functions[i] === "undefined") {
                        C$.$functions[i] = function(i) {
                            return function(value) {
                                this.style[i] = value;
                                return this;
                            }
                        }(i);
                    }
                }
                return this;
            },
            animate: function(properties,callback,time) {
                if(!this.animation) {
                    this.animation = new creasetoph.Animation();
                    this.animation.instance = [];
                    this.animation.element = this;
                    this.animation.properties = properties;
                    this.animation.callback = callback || this.animation.callback;
                    this.animation.time = time || this.animation.time;
                }
                return this.animation;
            },
            get_attribute: function(attribute) {
                return this.getAttribute(attribute);
            },
            get_attributes: function(attributes) {
                var ret = {};
                C$.foreach(attributes,function(key,name) {
                    var tmp = this.get_attribute(name);
                    ret[name] = tmp;
                },this);
                return ret;
            },
            set_attribute: function(attribute,value) {
                var type = typeof attribute,
                    self = this;
                if(type === 'object') {
                    C$.foreach(attribute,function(k,v) {
                        self.setAttribute(k,v);
                    });
                }else if(type === 'string') {
                    this.setAttribute(attribute,value);
                }
                
                return this;
            },
            set_attributes: function(attributes) {
                C$.foreach(attributes,function(name,value) {
                    this.set_attribute(name,value);
                },this);
            },
            add_class: function(class_name) {
                if(this.className.indexOf(class_name) === -1) {
                    if(this.className !== ''){
                        class_name = ' ' + class_name;
                    }
                    this.className += class_name;
                }
                return this;
            },
            remove_class: function(class_name) {
                if(this.className.indexOf(class_name) !== -1) {
                    this.className = this.className.replace(class_name, '');
                }
                return this;
            },
            has_class: function(class_name) {
                if(this.className.indexOf(class_name) === -1) {
                    return false;
                }
                return true;
            },
            set: function(text) {
                switch(this.type) {
                    case 'input':
                        this.value = text;
                        break;
                    case undefined:
                        this.innerHTML = text;
                        break;
                }
                return this;
            },
            get: function() {
                switch(this.tagName.toLowerCase()) {
                    case 'input':
                    case 'textarea':
                    case 'select':
                        return this.value;
                        break;
                    default:
                        return this.innerHTML;
                }
            },
            new_el: function(new_els) {
                if(typeof new_els === 'object' && typeof new_els.length === 'undefined') {
                    new_els = [new_els];
                }
                var els = C$.foreach(new_els, function(key,value) {
                    var el = C$.extend_obj(document.createElement(value.type),C$.$functions);
                    if(typeof new_els[key]['id'] !== 'undefined') {
                        el.id = new_els[key]['id'];
                    }
                    if(typeof new_els[key]['class'] !== 'undefined') {
                        el.add_class(new_els[key]['class']);
                    }
                    if(typeof new_els[key]['text'] !== 'undefined') {
                        el.set(new_els[key]['text']);
                    }
                    if(typeof new_els[key]['attributes'] !== 'undefined') {
                        el.set_attributes(new_els[key]['attributes']);
                    }
                    return el;
                });
                if(els.length === 1) {
                    return els[0];
                }else {
                    return els;
                }
            },
            append_new: function(type) {
                this.append(this.new_el(type));
                return this;
            },
            append: function(els) {
                var self = this;
                if(typeof els.length === 'undefined') {
                    els = Array.prototype.slice.call(arguments, 0);
                }
                C$.foreach(els, function(index,el) {
                    self.appendChild(el);
                });
                return this;
            },
            remove: function(els) {
                var self = this;
                if(typeof els.length === 'undefined') {
                    els = Array.prototype.slice.call(arguments, 0);
                }
                C$.foreach(els, function(index,el) {
                    self.removeChild(el);
                });
                return this;
            },
            insert_after: function(after_node) {
                after_node.parentNode.insertBefore(this,after_node.nextSibling);
                return this;
            },
            get_sibling:function(sibling) {
                var match = {
                    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/
                },type;
                for(type in match) {
                    if(match[type].exec(sibling)) {
                        break;
                    }
                }
                switch(type) {
                    case 'ATTR':
                        var pos,attr,dir = 'previous',tmp;
                        var get_sibling_by_attribute = function(el) {
                            pos = sibling.indexOf('=');
                            if(pos != -1) {
                                attr = sibling.substr(pos + 1, (sibling.length - pos) - 2);
                                if(el.getAttribute && attr == el.getAttribute(sibling.substr(1,pos - 1))) {
                                    return el;
                                }else {
                                    return get_sibling_by_attribute(el[dir + 'Sibling']);
                                }
                            }else {
                                if(el.getAttribute && el.getAttribute(sibling.substr(1,sibling.length - 2))) {
                                    return el;
                                }else {
                                    return get_sibling_by_attribute(el[dir + 'Sibling']);
                                }
                            }
                            return false;
                        };
                        tmp = $(get_sibling_by_attribute(this));
                        if(!tmp) {
                            dir = 'next';
                            tmp = $(get_sibling_by_attribute(this));
                        }
                        return tmp;
                        
                        break;
                     case 'TAG':
                        //var get_parent_by_tag = function(el) {
                            //if(el.tagName && el.tagName == parent.toUpperCase()) {
                                //return el;
                            //}else {
                                //return get_parent_by_tag(el.parentNode);
                            //}
                        //};
                        //return $(get_parent_by_tag(this));

                        break;
                    case 'CLASS':
                        //var get_parent_by_ = function(el) {
                            //var parts = C$.objectify(el.getAttribute(type).split(' '));
                            //if(el.getAttribute && parts[parent.substr(1)]) {
                                //return el;
                            //}
                            //return get_parent_by_(el.parentNode);
                        //};
                        //return $(get_parent_by_(this));
                        break;
                    case 'ID':
                        //var get_parent_by_ = function(el) {
                            //if(el.getAttribute && el.getAttribute(type) == parent.substr(1)) {
                                //return el;
                            //}else {
                                //return get_parent_by_(el.parentNode);
                            //}
                        //};
                        //return $(get_parent_by_(this));
                        break;
                }
            },
            get_parent: function(parent) {
                var match = {
                    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/
                },type;
                for(type in match) {
                    if(match[type].exec(parent)) {
                        break;
                    }
                }
                switch(type) {
                    case 'ATTR':
                        var pos,attr;
                        var get_parent_by_attribute = function(el) {
                            pos = parent.indexOf('=');
                            if(pos != -1) {
                                attr = parent.substr(pos + 1, (parent.length - pos) - 2);
                                if(el.getAttribute && attr == el.getAttribute(parent.substr(1,pos - 1))) {
                                    return el;
                                }else {
                                    return get_parent_by_attribute(el.parentNode);
                                }
                            }else {
                                if(el.getAttribute && el.getAttribute(parent.substr(1,parent.length - 2))) {
                                    return el;
                                }else {
                                    return get_parent_by_attribute(el.parentNode);
                                }
                            }
                        };
                        return $(get_parent_by_attribute(this));
                        
                        break;
                     case 'TAG':
                        var get_parent_by_tag = function(el) {
                            if(el.tagName && el.tagName == parent.toUpperCase()) {
                                return el;
                            }else {
                                return get_parent_by_tag(el.parentNode);
                            }
                        };
                        return $(get_parent_by_tag(this));

                        break;
                    case 'CLASS':
                    	var get_parent_by_ = function(el) {
                    		var parts = C$.objectify(el.getAttribute(type).split(' '));
                            if(el.getAttribute && parts[parent.substr(1)]) {
                                return el;
                            }
                            return get_parent_by_(el.parentNode);
                        };
                        return $(get_parent_by_(this));
                        break;
                    case 'ID':
                        var get_parent_by_ = function(el) {
                            if(el.getAttribute && el.getAttribute(type) == parent.substr(1)) {
                                return el;
                            }else {
                                return get_parent_by_(el.parentNode);
                            }
                        };
                        return $(get_parent_by_(this));
                        break;
                }
            },
            get_child: function(child) {
                var arr = [],tmp;
                if(typeof child === 'object') {
                    for(var i in child) {
                        tmp = this.get_child(child[i]);
                        if(tmp !== undefined) {
                            arr = arr.concat(this.get_child(child[i]));
                        }
                    }
                }else {
                    return $(child,this);
                }
                return arr;
            },
            determine_selector: function(selector) {
                switch(selector.charAt(0)) {
                    case '.':
                        return 'class';
                        break;
                    case '#':
                        return 'id';
                        break;
                    case '[':
                        return selector.substr(1,selector.length - 2);
                        break;
                }
            },
            attach_event: function(event,controller) {
                if(typeof this.removeEventListener !== 'undefined') {
                    this.removeEventListener(event,C$.front_controller,true);
                    this.addEventListener(event,C$.front_controller,true);
                }else if(typeof this.attachEvent !== 'undefined') {
                    this.detachEvent('on' + event,C$.front_controller);
                    this.attachEvent('on' + event,C$.front_controller);
                }
                
                if(typeof controller.prototype.cursor === 'string') {
                    this.style.cursor = controller.prototype.cursor;
                }else if(controller.prototype.cursor !== false) {
                    if(this.type == 'text') {
                        this.style.cursor = 'text';
                    }else {
                        this.style.cursor = 'pointer';
                    }
                }
                return this;
            },
            remove_event: function(event) {
                if(typeof this.removeEventListener !== 'undefined') {
                    this.removeEventListener(event,C$.front_controller,true);
                }else if (typeof this.detachEvent) {
                     this.attachEvent(event,C$.front_controller);
                }
                return this;
            },
            get_controller: function() {
                return this.getAttribute(C$.controller_name);
            },
            get_controller_object: function() {
                return this.getAttribute(C$.controller_object_name);
            },
            get_form: function() {
                return this.getAttribute(C$.form_name);
            },
            get_name: function() {
                return this.get_attribute('name');
            },
            add_controller: function(controller_name, controller_parent,obj) {
                C$.inherit(controller_name,controller_parent).prototype = obj;
                C$.do_inheritance(controller_name);
                this.set_controller(C$.find_object(controller_name));
                return this;
            },
            set_controller: function(controller) {
                this.set_controller_attribute(controller.class_name);
                this.bind_controller();
                return this;
            },
            set_controller_attribute: function(controller) {
                this.set_attribute(C$.controller_name,controller);
                return this;
            },
            add_form: function(form_name,form_parent,obj) {
                C$.inherit(form_name,form_parent).prototype = obj;
                C$.do_inheritance(form_name);
                this.set_form(C$.find_object(form_name));
                return this;
            },
            set_form: function(form) {
                this.set_form_attribute(form.class_name);
                this.bind_form();
                return this;
            },
            set_form_attribute: function(form) {
                this.set_attribute(C$.form_name,form);
                return this;
            },
            remove_controller_attribute: function() {
                this.set_attribute(C$.controller_name,'');
                return this;
            },
            remove_controller: function() {
                var controller = C$.find_object(this.get_controller());
                if(controller) {
                    controller.prototype.unbind_events();
                    C$.destroy_controller(this.get_controller());
                }
                return this;
            },
            find_controller_object: function(controller) {
                var objs = this.getAttribute(C$.controller_object_name),
                    new_controller = controller,
                    split;
                if(objs === null) {
                    return controller;
                }
                split = objs.split(' ');
                for(var i in split) {
                    if(split.hasOwnProperty(i)) {
                        new_controller = new_controller[split[i]];
                    }
                }
                return new_controller;
            },
            bind_controller: function() {
                var this_controller = this.get_controller(),
                    obj = C$.find_object(this_controller);
                //determine if singleton
                if(obj && typeof obj.prototype.singleton !== 'undefined' && !obj.prototype.singleton) {
                    this.set_controller_attribute(this_controller + '_' + this.get_name());
                    C$.inherit(this_controller + '_' + this.get_name(), this_controller);
                    C$.do_inheritance(this_controller + '_' + this.get_name());
                    obj = C$.find_object(this_controller + '_' + this.get_name());
                    this_controller += '_' + this.get_name();
//                    debugger;
                }
                //end
                C$.controllers[this_controller] = obj;
                if(obj.prototype) {
                    obj.prototype.element = this;
                }
                if(obj) {
                   for(var c in obj.prototype.Events) {
                       this.attach_event(c,obj);
                   }
                   if(obj.prototype.onBind) {
                       obj.prototype.onBind();
                   }
                }
                return this;
            },
            bind_form: function() {
                var this_form = this.get_form(),
                    obj = C$.find_object(this_form);
                C$.forms[this_form] = obj;
                if(obj && obj.prototype.onBaseFormBind) {
                    obj.prototype.onBaseFormBind(this);
                }
                if(obj && obj.prototype.onFormBind) {
                    obj.prototype.onFormBind();
                }
            },
            add_dialog: function(name,dialog_properties,type) {
                dialog_properties = dialog_properties || {};
                type = type || 'Static';
                this.add_controller(name,"CreasetophDialog" + type)
                for(var i in dialog_properties) {
                    creasetoph[name].prototype[i] = dialog_properties[i];
                }
                
                return this;
            },
            ajax: function(url,callback,post_vars,scope) {
                C$.ajax(url,callback,post_vars,scope);
                return this;
            }
        },
        objectify: function(arr) {
        	if(arr.length) {
        		var obj = {};
	        	for(var i = 0, l = arr.length;i < l;i++) {
	        		obj[arr[i]] = arr[i];
	        	}
	        	return obj;
        	}
        },
        init: function() {
            C$.detect_browser();
            for(var i in namespace) {
                if(namespace.hasOwnProperty(i)) {
                    C$.do_inheritance(i);
                }
            }
            C$.bind(document);
            var model = creasetoph.CreasetophModel.prototype;
            if(model.ajax_navigation) {
                model.navigate(window.location.hash.substr(1));
                setInterval(model.poll_hash,1000);
            }
        },
        bind: function(root) {
            this.bind_controllers(root);
            this.bind_forms(root);
        },
        bind_controllers: function(root) {
            var controllers = C$.get_elements_by_attribute(C$.controller_name,root);
            if(controllers) {
               for(var i in controllers) {
                   $(controllers[i]).bind_controller();
                }
            }
        },
        bind_forms: function(root) {
            var forms = C$.get_elements_by_attribute(C$.form_name,root),
                this_form, i, obj;
            if(forms) {
                for(i in forms) {
                    $(forms[i]).bind_form();
                }
            }
        },
        front_controller: function(e) {
            var el = e.currentTarget || e.srcElement,controller,event,
                controller_name = $(el).get_controller();
            if(controller_name) {
                controller = C$.find_object(controller_name).prototype
            }else {
                el = $(el).get_parent('[' + C$.controller_name + ']');
                controller = C$.find_object($(el).get_controller()).prototype;
            }
            if(controller.dynamic_events) {
                controller = $(el).find_controller_object(controller);
            }
            event = controller.Events[e.type];
            e.controlled_by = $(el).get_controller();
            e.controlled_by_id = el.getAttribute('id');
            e.controlled_by_element = el;                                       //element with the controller attribute on it
            e.target_element = e.originalTarget || e.target || e.srcElement;    //element that was clicked
            controller.target_element = e.target_element;
            controller[event](e);
        },
        get_elements_by_attribute: function(attribute,root) {
            root = root || document;
            var els = $('*[' + attribute + ']:not(.hidden_cache_container *)',root,true);
            return els;
        },
        destroy_controller: function(controller_name) {
            if(typeof namespace[controller_name].destroy === 'function') {
                namespace[controller_name].destroy();
            }
            namespace[controller_name] = null;
        },
        encode_url: function(obj) {
            var url = [], i;
            for(i in obj) {
                url.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
            }
            return url.join('&');
        },
        is_array: function(obj) {
            return obj instanceof Array;
        },
        active_ajax: 0,
        total_ajax: 0,
        ajax: function(url,callback,post_vars,scope,ret_text) {
            ret_text = ret_text || false;
            var method = (post_vars === null) ? 'GET' : 'POST',
                ret,
                createXhrObject =  function() {
                    var methods = [
                        function() {return new XMLHttpRequest();},
                        function() {return new ActiveXObject('Msxml2.XMLHTTP')},
                        function() {return new ActiveXObject('Microsoft.XMLHTTP')}
                    ];
                    var conn;
                    for(var i = 0,len = methods.length;i < len; i++) {
                        try{
                            conn = methods[i]();
                        }catch(e) {
                            continue;
                        }
                        this.createXhrObject = conn;
                        return conn;
                    };
                    throw new Error('createXhrObject: Could not create an ajax connection')
                },
                xhr = createXhrObject(),
                post;
            xhr.onreadystatechange = function() {
                if(xhr.readyState !== 4) {return};
                if(xhr.status === 200) {
                    C$.active_ajax--;
                    if(!ret_text && xhr.responseText) {
                        ret = eval('(' + xhr.responseText + ')');
                    }else {
                        ret = xhr.responseText;
                    }
                    if(scope) {
                        scope[callback](ret);
                    }else {
                        callback(ret);
                    }
                }else {
                    //TODO ajax error
                }
            };
            xhr.open(method,url,true);
            if(method === 'POST') {
                post = C$.encode_url(post_vars);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader("Content-length", post.length);
                xhr.setRequestHeader("Connection", "close");
            }
            xhr.send(post);
            this.total_ajax++;
            this.active_ajax++;
        },
        fps: 16,
        animation: function(animation_obj,el) {
            var self = animation_obj;
            var ret = function() {};
            ret.prototype = {
                element: el,
                queue: null,
                tween_forward: true,
                first_toggle: true,
                determine_direction: function(start, end) {
                    if(start < end) {
                        return '+';
                    }else {
                        return '-';
                    }
                },
                set_current: function() {
                    var i, prop;
                    for(i in this.queue.moves) {
                        prop = this.queue.moves[i].property;
                        this.queue.moves[i].current = this.element['offset'+ prop.charAt(0).toUpperCase() + prop.slice(1)];
                    }
                },
                toggle_tweener: function() {
                    if(!this.first_toggle) {
                        for(var i in this.queue.moves) {
                            var dir = this.queue.moves[i].direction;
                            if(dir === '+') {
                                this.set_tweener('-',i);
                            }else if(dir === '-') {
                                this.set_tweener('+',i);
                            }
                        }
                    }
                    this.first_toggle = false;
                },
                set_tweener: function(dir,index) {
                    this.queue.moves[index].tweener = C$.tweener(dir);
                    this.queue.moves[index].direction = dir;
                },
                switch_tweener: function() {
                    for(var i in this.queue.moves) {
                        var dir = this.queue.moves[i].original_direction;
                        if(dir === '+') {
                            this.set_tweener('-',i);
                        }else if(dir === '-') {
                            this.set_tweener('+',i);
                        }
                    }
                },
                reset_tweener: function() {
                    for(var i in this.queue.moves) {
                        this.set_tweener(this.queue.moves[i].original_direction,i);
                    }
                },
                play: function() {
                    this.build_queue();
                    if(!this.queue.playing) {
                        this.play_animation();
                    }
                },
                forward: function() {
                    this.build_queue();
                    this.reset_tweener();
                    this.play()
                },
                backward: function() {
                    this.build_queue();
                    this.switch_tweener();
                    this.play();
                    
                },
                toggle: function() {
                    this.build_queue();
                    this.toggle_tweener();
                    this.play();
                },
                stop: function(func) {
                    if(this.queue.playing) {
                        if(typeof func == 'function') {
                            this.onStop = function() {
                                func();
                            };
                        }
                        this.queue.pause = true;
                    }
                },
                play_animation: function(){
                    var me = this;
                    this.queue.playing = true;
                    this.queue.done = false;
                    (function animate() {
                        if(!me.queue.pause) {
                            for(var i in me.queue.moves) {
                               var prop = me.queue.moves[i].property;
                               if(prop === 'opacity') {
                                   me.element.style[prop] = me.queue.moves[i].tweener.call(me,i);
                               }else {
                                   me.element.style[prop] = me.queue.moves[i].tweener.call(me,i) + 'px';
                               }
                            }
                            setTimeout(animate,(1 / C$.fps));
                        }else {
                            me.queue.playing = false;
                            me.queue.pause = false;
                            me.queue.done = true;
                            self.onEnd();
                            return;
                        }
                    })();
                },
                build_queue: function(){
                    if(this.queue == null) {
                        var prop, o, arr = [],q = {};
                        q.pause = false;
                        q.done = false;
                        q.playing = false;
                        for(prop in self.properties) {
                            if(self.properties.hasOwnProperty(prop)) {
                                o = {};
                                o.property = prop;
                                o.end_value = self.properties[prop];
                                if(prop === 'opacity') {
                                    o.start_value = this.element.style[prop] || 1;
                                }else {
                                    o.start_value = this.element['offset'+ prop.charAt(0).toUpperCase() + prop.slice(1)] || 0;
                                }
                                o.diff = o.end_value - o.start_value;
                                o.time = self.time * .001; //in milliseconds
                                o.frames = C$.fps * o.time;
                                o.tween = Math.abs(o.diff / o.frames);
                                o.current = o.start_value;
                                o.direction = this.determine_direction(o.start_value,o.end_value);
                                o.original_direction = o.direction;
                                o.tweener = C$.tweener(o.direction);
                                arr.push(o);
                            }
                        }
                        this.queue = q;
                        this.queue.moves = arr;
                    }
                }
            };
            return new ret;
        },
        tweener: function(dir) {
            if(dir == '+') {
                return function(index) {
                    var obj = this.queue.moves[index];
                    obj.current += obj.tween;

                    if(obj.original_direction === '+') {
                        if(obj.current >= obj.end_value) {
                            this.queue.pause = true;
                            return obj.end_value;
                        }
                    }else {
                        if(obj.current >= obj.start_value) {
                            this.queue.pause = true;
                            return obj.start_value;
                        }
                    }    
                    return obj.current;
                }
            }else if(dir == '-') {
                return function(index) {
                    var obj = this.queue.moves[index];
                    obj.current -= obj.tween;

                    if(obj.original_direction === '+') {
                        if(obj.current <= obj.start_value) {
                            this.queue.pause = true;
                            return obj.start_value;
                        }
                    }else {
                        if(obj.current <= obj.end_value) {
                            this.queue.pause = true;
                            return obj.end_value;
                        }
                    }
                    return obj.current;
                }
            }
        },
        toggler: function(element, property, new_value) {
            var toggle = false,
                old_value = element[property];
            return function() {
                if(!toggle) {
                    element[property] = new_value;
                    toggle = true;
                }else {
                    element[property] = old_value;
                    toggle = false;
                }
            };
        },
        detect_browser: function() {
            var browsers = C$.browsers;
            for(var i in browsers) {
                if(browsers[i]) {
                    this.browser = i;
                    break;
                }
            }
        },
        when_DOM_ready: function(callback) {
            //var DomReady = window.DomReady = {};
            var userAgent = navigator.userAgent.toLowerCase();
            var browser = {
//                version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
                chrome: /chrome/.test(userAgent),
                safari: /webkit/.test(userAgent),
                opera: /opera/.test(userAgent),
                msie: (/msie/.test(userAgent)) && (!/opera/.test( userAgent )),
                mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
            };
            C$.browsers = browser;
            var readyBound = false;
            var isReady = false;
            var readyList = [];
            function domReady() {
                if(!isReady) {
                    isReady = true;
                    if(readyList) {
                        for(var fn = 0; fn < readyList.length; fn++) {
                            readyList[fn].call(window, []);
                        }
                        readyList = [];
                    }
                }
            };
            function addLoadEvent(func) {
              var oldonload = window.onload;
              if (typeof window.onload != 'function') {
                window.onload = func;
              } else {
                window.onload = function() {
                  if (oldonload) {
                    oldonload();
                  }
                  func();
                }
              }
            };
            function bindReady() {
                if(readyBound) {
                    return;
                }
                readyBound = true;
                if (document.addEventListener && !browser.opera) {
                    document.addEventListener("DOMContentLoaded", domReady, false);
                }
                if (browser.msie && window == top) (function(){
                    if (isReady) return;
                    try {
                        document.documentElement.doScroll("left");
                    } catch(error) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    domReady();
                })();
                if(browser.opera) {
                    document.addEventListener( "DOMContentLoaded", function () {
                        if (isReady) return;
                        for (var i = 0; i < document.styleSheets.length; i++)
                            if (document.styleSheets[i].disabled) {
                                setTimeout( arguments.callee, 0 );
                                return;
                            }
                        domReady();
                    }, false);
                }
                if(browser.safari) {
                    var numStyles;
                    (function(){
                        if (isReady) return;
                        if (document.readyState != "loaded" && document.readyState != "complete") {
                            setTimeout( arguments.callee, 0 );
                            return;
                        }
                        if (numStyles === undefined) {
                            var links = document.getElementsByTagName("link");
                            for (var i=0; i < links.length; i++) {
                                if(links[i].getAttribute('rel') == 'stylesheet') {
                                    numStyles++;
                                }
                            }
                            var styles = document.getElementsByTagName("style");
                            numStyles += styles.length;
                        }
                        if (document.styleSheets.length != numStyles) {
                            setTimeout( arguments.callee, 0 );
                            return;
                        }
                        domReady();
                    })();
                }
                addLoadEvent(domReady);
            };
            var ready = function(fn, args) {
                bindReady();
                if (isReady) {
                    fn.call(window, []);
                } else {
                    readyList.push( function() {return fn.call(window, []);} );
                }
            }(callback);
        }
    };
    window.C$ = C$;
    window.$ = C$.$;

})();
