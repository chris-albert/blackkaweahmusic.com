/**
 * This is where all the base classes for the rest of the application will reside
 * @author creasetoph
 */
(function() {
    C$.inherit('CreasetophDialogController','CreasetophController').prototype = {
        dialog: null,
        content: '',
        open_dialog: function(e) {
            if(this.dialog === null) {
                this.dialog = new creasetoph.CreasetophDialog;
//                this.dialog.content = this.content;
                this.dialog.create_dialog(this,e);
            }
        },
        close_dialog: function() {
            if(this.dialog !== null) {
                this.dialog.close();
                this.dialog = null;
            }
        }
    };

    C$.inherit('CreasetophDialog','CreasetophController').prototype = {
        dialog      : true,
        append_to   : 'body',
        height      : 0,
        width       : 0,
        center      : false,
        fixed       : false,
        fixed_box   : false,
        container   : null,
        header      : null,
        body        : null,
        show_header : true,
        header_text : '',
        resizeable  : true,
        closeable   : true,
        minimizable : false,
        minimized   : false,
        no_overflow : false,
        mask        : false,
        mask_opacity: 5,
        offset_top  : 10,
        offset_left : 10,
        content     : '',
        padding     : 20,
        cursor      : false,
        zindex      : 10,
        view: {
            x : 0,
            y : 0
        },
        dialog_base_class: 'dialog_main_container',
        custom_base_class: '',
        setup: function(event) {
            //set up container
            this.set_view();
            this.container = document.createElement('div');
           
            $(this.container).css({
                'position': 'absolute',
                'zIndex'  : this.zindex
            });
            $(this.container).set_attribute('class',this.dialog_base_class);
            if(this.custom_base_class !== '') {
                $(this.container).add_class(this.custom_base_class);
            }
            if(this.show_header) {
                this.header = new creasetoph.CreasetophDialogHeader;
                this.header.setup(this);
            }
            this.body = new creasetoph.CreasetophDialogBody;
            this.body.setup(this);
            
            if(this.resizeable) {
                this.resize = new creasetoph.CreasetophDialogResize;
                this.resize.setup(this);
            }
            this.element = this.container;
//            C$.bind(this.body.element);

            $(this.append_to).appendChild(this.container);
            this.height = this.height || this.body.element.offsetHeight;
            this.width = this.width || this.body.element.offsetWidth;
            if(this.center) {
                this.center_dialog();
            }else if(this.fixed) {
                this.set_xy(this.left,this.top);
            }else {
                this.set_xy(
                    (event.pageX + this.offset_left),
                    (event.pageY + this.offset_top)
                );
            }
            if(this.fixed_box) {
                $(this.element).style.position = 'fixed';
            }
        },
        create_dialog: function(dialog_controller,event) {
            this.dialog_controller = dialog_controller;
            //copy all properties from dialog_controller that start with dialog_
            for(var i in dialog_controller) {
                if(i.indexOf('dialog_') === 0) {
                    if(typeof dialog_controller[i] === 'function') {
                        this[i.substr(7)] = dialog_controller[i]();
                    }else {
                        this[i.substr(7)] = dialog_controller[i];
                    }
                }
            }
            this.setup(event);
            if(this.mask) {
                this.add_mask()
            }
            if(typeof this.dialog_controller.on_build === 'function') {
                this.dialog_controller.on_build();
            }
        },
        onClick: function(e) {
            return false;
        },
        center_dialog: function() {
            this.set_xy(
                (this.view.x / 2) - (this.width / 2) + window.scrollX,
                (this.view.y / 2) - (this.height / 2) + window.scrollY
            );
        },
        close: function() {
            $(this.append_to).removeChild(this.container);
            this.dialog_controller.dialog = null;
            if(this.mask) {
                this.remove_mask()
            }
        },
        get_header_height: function() {
            if(this.header !== null) {
                return this.header.height;
            }
            return 0;
        },
        set_xy: function(x,y) {
            if(this.no_overflow) {
                if(x + this.width > this.view.x) {
                    x = x - this.width;
                }
                if(y + this.height > this.view.y) {
                    y = y - this.height - this.padding;
                }
            }
            this.container.style.left = x + 'px';
            this.container.style.top = y + 'px';
        },
        set_view: function() {
            this.view.x = window.innerWidth;
            this.view.y = window.innerHeight;
            this.view.y_total = $('body').offsetHeight;
            this.view.x_total = $('body').offsetWidth;
        },
        set_dialog_coords: function() {
            this.coords = {
                top: {left: {
                        x: this.container.offsetLeft,
                        y: this.container.offsetTop
                    },right: {
                        x: this.container.offsetLeft + this.container.offsetWidth,
                        y: this.container.offsetTop
                    }
                },
                bottom: {left: {
                        x: this.container.offsetLeft,
                        y: this.container.offsetTop + this.container.offsetHeight
                    },right: {
                        x: this.container.offsetLeft + this.container.offsetWidth,
                        y: this.container.offsetTop + this.container.offsetHeight
                    }
                }
            };
        },
        anchor: function(corner) {
            switch(corner) {
                case 'top_left':
                    this.set_position({
                        top : this.coords.top.left.y,
                        left: this.coords.top.left.x
                    });
                    break;
                case 'top_right':
                    this.set_position({
                        top  : this.coords.top.right.y,
                        right: this.view.x - this.coords.top.right.x
                    });
                    break;
                case 'bottom_left':
                    this.set_position({
                        bottom : this.view.y - this.coords.bottom.left.y,
                        left   : this.coords.top.left.x
                    });
                    break;
                case 'bottom_right':
                    this.set_position({
                        right : this.view.x - this.coords.top.right.x,
                        bottom: this.view.y - this.coords.bottom.left.y
                    });
                    break;
            }
        },
        set_position: function(coords) {
            var tmp = ['top','left','right','bottom'];
            for(var i in tmp) {
                if(typeof coords[tmp[i]] === 'number') {
                    this.container.style[tmp[i]] = coords[tmp[i]] + 'px';
                }else {
                    this.container.style[tmp[i]] = '';
                }
            }
        },
        add_mask: function() {
            this.mask = document.createElement('div');
            $(this.mask).css({
                'width'     : this.view.x + 'px',
                'height'    : this.view.y_total + 'px',
                'position'  : 'absolute',
                'top'       : 0,
                'left'      : 0,
                'zIndex'    : 50,
                'opacity'   : this.mask_opacity,
                'backgroundColor': 'black'
            });
            $(this.append_to).css({
                'overflow' : 'hidden'
                })
                .appendChild(this.mask);
        },
        remove_mask: function() {
            $(this.append_to).css({
                'overflow': 'visible'
                })
                .removeChild(this.mask);
        },
        set_minimized: function() {
            $(this.header.up_box.element).css({
                'backgroundImage': 'url(../images/up.png)'
            });
            $(this.header.element).css({
                'borderBottom'   : 'none'
            });
            this.minimized = true;
        },
        set_un_minimized: function() {
            $(this.header.up_box.element).css({
                'backgroundImage': 'url(../images/down.png)'
            });
            $(this.header.element).css({
                'borderBottom'   : '1px solid black'
            });
            this.minimized = false;
        },
        minimize: function() {
            this.set_dialog_coords();
            this.anchor('bottom_left');
            $(this.body.element).animate({'height': this.min_height},function(){},500).play();
            $(this.body.element).animation = null;
            this.set_minimized();
        },
        un_minimize: function() {
            this.set_dialog_coords();
            this.anchor('bottom_left');
            $(this.body.element).animate({'height': this.height},function(){},500).play();
            $(this.body.element).animation = null;
            this.set_un_minimized();
        }
    };

    C$.inherit('CreasetophDialogHeader','CreasetophController').prototype = {
        dialog : null,
        height: 20,
        cursor: 'move',
        dialog_header_class: 'dialog_header',
        header_text: null,
        Events: {
            'mousedown' : 'onMouseDown',
            'mouseup'   : 'onMouseUp'
        },
        setup: function(dialog) {
            this.dialog = dialog;
            this.header = document.createElement('div');
            this.header.style.height = this.height + 'px';
            this.header.style.borderBottom = '1px solid black';
            $(this.header).set_attribute('class',this.dialog_header_class);
            this.dialog.container.appendChild(this.header);
            $(this.header).set_attribute(C$.controller_name,this.dialog.dialog_controller.object.class_name);
            $(this.header).set_attribute(C$.controller_object_name,'dialog header');
            this.element = this.header;
            if(this.dialog.closeable) {
                this.bind_events();
            }
            this.set_text(this.dialog.header_text);
            if(this.dialog.closeable) {
                this.close_box = new creasetoph.CreasetophDialogCloseBox;
                this.close_box.setup(this);
            }
            if(this.dialog.minimizable) {
                this.up_box = new creasetoph.CreasetophDialogUpBox;
                this.up_box.setup(this);
            }
            this.round_top();
            
        },
        set_text: function(text) {
            if(this.header_text === null) {
                this.header_text = document.createElement('span');
                this.header_text.innerHTML = text;
                $(this.header_text).add_class('dialog_header_text');
                this.header.appendChild(this.header_text);
            }else {
                this.header_text.innerHTML = text;
            }
        },
        onMouseDown: function(e) {
            this.dialog.container.style.zIndex = this.dialog.container.style.zIndex + 1;
            this.dialog.top_diff = e.pageY - this.dialog.container.offsetTop;
            this.dialog.left_diff = e.pageX - this.dialog.container.offsetLeft;
            this.dialog.set_dialog_coords();
            this.dialog.anchor('top_left');
            creasetoph.CreasetophBody.prototype.bind_event(this,'mousemove','onMouseMove');
            e.preventDefault();
        },
        onMouseUp: function(e) {
            creasetoph.CreasetophBody.prototype.unbind_event('mousemove');
        },
        onMouseMove: function(e) {
            this.move(e.pageX - this.dialog.left_diff,e.pageY - this.dialog.top_diff);
        },
        move: function(x,y) {
            this.dialog.set_xy(x,y);
        },
        round_top: function() {
            this.header.style.MozBorderRadiusTopleft = '9px';
            this.header.style.webkitBorderTopLeftRadius = '9px';
            this.header.style.MozBorderRadiusTopright = '9px';
            this.header.style.webkitBorderTopRightRadius = '9px';
            this.dialog.container.style.MozBorderRadiusTopleft = '10px';
            this.dialog.container.style.webkitBorderTopLeftRadius = '10px';
            this.dialog.container.style.MozBorderRadiusTopright = '10px';
            this.dialog.container.style.webkitBorderTopRightRadius = '10px';
        },
        disable_drag: function() {
            this.unbind_event('mousedown');
            this.unbind_event('mouseup');
            this.header.style.cursor = 'default';
        },
        enable_drag: function() {
            this.bind_events(this.header);
            this.header.style.cursor = this.cursor;
        }
    };

    C$.inherit('CreasetophDialogCloseBox','CreasetophController').prototype = {
        Events: {
            'click' : 'onClick'
        },
        setup: function(header) {
            this.header = header;
            this.close_box = document.createElement('div');
            $(this.close_box).add_class('dialog_close_box')
            this.close_box.style.position = 'absolute';
            this.close_box.style.height = '10px';
            this.close_box.style.width = '10px';
            this.close_box.style.top = '5px';
            this.close_box.style.right = '5px';
            this.close_box.style.cursor = 'pointer';
            this.header.header.appendChild(this.close_box);
            $(this.close_box).set_attribute(C$.controller_name,this.header.dialog.dialog_controller.object.class_name);
            $(this.close_box).set_attribute(C$.controller_object_name,'dialog header close_box');
            this.element = this.close_box
            this.bind_events();
        },
        onClick: function(e) {
            this.header.dialog.close();
        }
    };

    C$.inherit('CreasetophDialogUpBox','CreasetophController').prototype = {
        Events: {
            'click' : 'onClick'
        },
        setup: function(header) {
            this.header = header;
            this.up_box = document.createElement('div');
            $(this.up_box).add_class('dialog_up_box')
            this.up_box.style.position = 'absolute';
            this.up_box.style.height = '10px';
            this.up_box.style.width = '10px';
            this.up_box.style.top = '5px';
            if(this.header.dialog.closeable) {
                this.up_box.style.right = '20px';
            }else {
                this.up_box.style.right = '5px';
            }
            this.up_box.style.backgroundImage = 'url(../images/up.png)';
            this.up_box.style.cursor = 'pointer';
            this.header.header.appendChild(this.up_box);
            $(this.up_box).set_attribute(C$.controller_name,this.header.dialog.dialog_controller.object.class_name);
            $(this.up_box).set_attribute(C$.controller_object_name,'dialog header up_box');
            this.element = this.up_box
            this.bind_events();
        },
        onClick: function(e) {
            if(this.header.dialog.minimized) {
                this.header.dialog.un_minimize();
            }else {
                this.header.dialog.minimize();
            }
        }
    };

    C$.inherit('CreasetophDialogBody','CreasetophController').prototype = {
        dialog_body_class: 'dialog_body',
        cursor: 'default',
        Events: {},
        setup: function(dialog) {
            this.dialog = dialog;
            this.body = document.createElement('div');
            if(this.dialog.minimizable) {
                if(this.dialog.minimized) {
                    this.body.style.height = this.dialog.min_height + 'px';
                    this.dialog.set_minimized();
                }else {
                    this.body.style.height = this.dialog.height + 'px';
                    this.dialog.set_un_minimized();
                }
            }else {
                this.body.style.height = this.dialog.height + 'px';
            }
            if(this.dialog.width !== '') {
                this.body.style.width = this.dialog.width + 'px';
            }
	    if(this.dialog.min_width !== '') {
		this.body.style.minWidth = this.dialog.min_width + 'px'; 
	    }
            this.set_content(this.dialog.content);
            $(this.body).set_attribute('class',this.dialog_body_class);
            this.dialog.container.appendChild(this.body);
            $(this.body).set_attribute(C$.controller_name,this.dialog.dialog_controller.object.class_name);
            $(this.body).set_attribute(C$.controller_object_name,'dialog body');
            this.element = this.body
            this.bind_events();
        },
        set_content: function(content) {
            this.body.innerHTML = content;
            C$.bind(this.body);
        },
        render: function() {
            this.body.innerHTML = this.dialog.content;
        }
    };

    C$.inherit('CreasetophDialogResize','CreasetophController').prototype = {
        cursor: false,
        hover_size: 3,
        edge_size: 5,
        min_width: 100,
        min_height: 100,
        coords: {},
        maximized: false,
        Events: {
            'mousedown' : 'onMouseDown',
            'mouseup'   : 'onMouseUp'
        },
        setup: function(dialog) {
            this.dialog = dialog;
            this.max_setup();
            this.right_setup();
            this.left_setup();
            this.top_setup();
            this.bottom_setup();
            this.bottom_right_setup();
            this.bottom_left_setup();
            this.top_right_setup();
            this.top_left_setup();
        },
        max_setup: function() {
             this.dialog.header.bind_event(this,'dblclick','onDblClick');
        },
        set_area: function(name,styles) {
            this[name] = document.createElement('div');
            this[name].style.position = 'absolute';
            $(this[name]).css(styles);
            $(this[name]).set_attribute('class',name);
            $(this[name]).set_attribute(C$.controller_name,this.dialog.dialog_controller.object.class_name);
            $(this[name]).set_attribute(C$.controller_object_name,'dialog resize');
            this.dialog.container.appendChild(this[name]);
            this.bind_events(this[name]);
        },
        left_setup: function() {
            this.set_area('left_pull',{
                cursor: 'w-resize',
                height: '100%',
                width : this.hover_size + 'px',
                left  : 0,
                top   : 0
            });
            var self = this;
            this.left_pull.onMouseDown = function(e) {
                self.dialog.anchor('top_right');
            };
            this.left_pull.onMouseMove = function(e) {
                this.resize_left(e);
            };
        },
        right_setup: function() {
            this.set_area('right_pull',{
                cursor: 'e-resize',
                height: '100%',
                width : this.hover_size + 'px',
                right : 0,
                top   : 0
            });
            var self = this;
            this.right_pull.onMouseDown = function(e) {
                self.dialog.anchor('top_left');
            };
            this.right_pull.onMouseMove = function(e) {
                this.resize_right(e);
            };
        },
        top_setup: function() {
            this.set_area('top_pull',{
                cursor: 'n-resize',
                height: this.hover_size + 'px',
                width : '100%',
                left  : 0,
                top   : 0
            });
            var self = this;
            this.top_pull.onMouseDown = function(e) {
                self.dialog.anchor('bottom_left');
            };
            this.top_pull.onMouseMove = function(e) {
                this.resize_top(e);
            };
        },
        bottom_setup: function() {
            this.set_area('bottom_pull',{
                cursor: 's-resize',
                height: this.hover_size + 'px',
                width : '100%',
                left  : 0,
                bottom: 0
            });
            var self = this;
            this.bottom_pull.onMouseDown = function(e) {
                self.dialog.anchor('top_left');
            };
            this.bottom_pull.onMouseMove = function(e) {
                this.resize_bottom(e);
            };
        },
        bottom_right_setup: function() {
            this.set_area('bottom_right_pull',{
                cursor: 'se-resize',
                height: this.edge_size + 'px',
                width : this.edge_size + 'px',
                right : 0,
                bottom: 0
            });
            var self = this;
            this.bottom_right_pull.onMouseDown = function(e) {
                self.dialog.anchor('top_left');
            };
            this.bottom_right_pull.onMouseMove = function(e) {
                this.resize_right(e);
                this.resize_bottom(e);
            };
        },
        bottom_left_setup: function() {
            this.set_area('bottom_left_pull',{
                cursor: 'sw-resize',
                height: this.edge_size + 'px',
                width : this.edge_size + 'px',
                left : 0,
                bottom: 0
            });
            var self = this;
            this.bottom_left_pull.onMouseDown = function(e) {
                self.dialog.anchor('top_right');
            };
            this.bottom_left_pull.onMouseMove = function(e) {
                this.resize_left(e);
                this.resize_bottom(e);
            };
        },
        top_right_setup: function() {
            this.set_area('top_right_pull',{
                cursor: 'ne-resize',
                height: this.edge_size + 'px',
                width : this.edge_size + 'px',
                top   : 0,
                right : 0
            });
            var self = this;
            this.top_right_pull.onMouseDown = function(e) {
                self.dialog.anchor('bottom_left');
            };
            this.top_right_pull.onMouseMove = function(e) {
                this.resize_right(e);
                this.resize_top(e);
            };
        },
        top_left_setup: function() {
            this.set_area('top_left_pull',{
                cursor: 'nw-resize',
                height: this.edge_size + 'px',
                width : this.edge_size + 'px',
                top   : 0,
                left  : 0
            });
            var self = this;
            this.top_left_pull.onMouseDown = function(e) {
                self.dialog.anchor('bottom_right');
            };
            this.top_left_pull.onMouseMove = function(e) {
                this.resize_left(e);
                this.resize_top(e);
            };
        },
        resize_left: function(e) {
            if (e.pageX <= (this.dialog.coords.top.right.x - this.min_width)) {
                this.dialog.body.body.style.width = (this.start_width + ((e.pageX - this.startX) * -1)) + 'px';
            }
        },
        resize_right: function(e) {
            if(e.pageX >= (this.dialog.coords.top.left.x + this.min_width)) {
                this.dialog.body.body.style.width = (this.start_width + (e.pageX - this.startX)) + 'px';
            }
        },
        resize_top: function(e) {
             if(e.pageY <= (this.dialog.coords.bottom.left.y - this.min_height - this.dialog.header.height)) {
                this.dialog.body.body.style.height = ((this.start_height - (e.pageY - this.startY)) - this.dialog.header.height) + 'px';
            }
        },
        resize_bottom: function(e) {
            if(e.pageY >= (this.dialog.coords.top.left.y + this.min_height + this.dialog.header.height)) {
                this.dialog.body.body.style.height = ((this.start_height + (e.pageY - this.startY)) - this.dialog.header.height) + 'px';
            }
        },
        onMouseDown: function(e) {
            this.startY = e.pageY;
            this.startX = e.pageX;
            this.start_width = this.dialog.container.offsetWidth;
            this.start_height = this.dialog.container.offsetHeight;
            this.dialog.set_dialog_coords();
            this.onMouseMove = this[e.target.className].onMouseMove;
            this[e.target.className].onMouseDown();
            creasetoph.CreasetophBody.prototype.bind_event(this,'mousemove','onMouseMove');
            creasetoph.CreasetophBody.prototype.bind_event(this,'mouseup','onMouseUp');
            creasetoph.CreasetophBody.prototype.element.style.cursor = this[e.target.className].style.cursor;
            this.dialog.body.body.style.cursor = this[e.target.className].style.cursor;
            
            e.preventDefault();
        },
        onMouseUp: function(e) {
            this.startY = 0;
            this.startX = 0;
            creasetoph.CreasetophBody.prototype.unbind_event('mousemove');
            creasetoph.CreasetophBody.prototype.unbind_event('mouseup');
            creasetoph.CreasetophBody.prototype.element.style.cursor ='default';
            this.dialog.body.body.style.cursor = 'default';
        },
        onDblClick: function(e) {
            if(this.maximized) {
                this.un_maximize();
            }else {
                this.maximize();
            }
        },
        maximize: function() {
            this.pre_max = {
                width  : this.dialog.body.body.offsetWidth,
                height : this.dialog.body.body.offsetHeight,
                left   : this.dialog.container.offsetLeft,
                top    : this.dialog.container.offsetTop
            };
            $(this.dialog.container).css({
                'top'    : '0',
                'left'   : '0',
                'right'  : '',
                'bottom' : ''
            });
            $(this.dialog.body.element).css({
                'height' : (window.innerHeight - this.dialog.header.height) + 'px',
                'width'  : (window.innerWidth - 2) + 'px'
            })
            this.dialog.header.disable_drag();
            this.maximized = true;
        },
        un_maximize: function() {
            $(this.dialog.container).css({
                'top'    : this.pre_max.top,
                'left'   : this.pre_max.left,
                'right'  : '',
                'bottom' : ''
            });
            $(this.dialog.body.element).css({
                'height' : this.pre_max.height + 'px',
                'width'  : this.pre_max.width + 'px'
            })
            this.dialog.header.enable_drag();
            this.maximized = false;
        },
        onMouseMove: function(e) {
        }
    };

    C$.inherit('CreasetophDialogClick','CreasetophDialogController').prototype = {
        Events: {
            'click' : 'onClick'
        },
        onClick: function(e) {
            this.open_dialog(e);
        }
    };

    C$.inherit('CreasetophDialogHover','CreasetophDialogController').prototype = {
        Events: {
            'mouseover' : 'onMouseOver',
            'mouseout'  : 'onMouseOut'
        },
        onMouseOver: function(e) {
            this.open_dialog(e);
        },
        onMouseOut: function(e) {
            this.close_dialog();
        },
        destroy: function() {
            this.unbind_events(this.element);
            this.element.style.cursor = 'default';
        }
    };

    C$.inherit('CreasetophDialogCustom','CreasetophDialogController').prototype = {
        Events: {},
        open: function(e) {
            this.open_dialog(e);
        },
        close: function() {
            this.close_dialog();
        }
    };

    C$.inherit('CreasetophDialogMoveable','CreasetophDialogClick').prototype = {
        dynamic_events              : true,
        dialog_height               : 200,
        dialog_width                : 200,
        dialog_custom_base_class    : '',
        dialog_center               : false,
        dialog_show_header          : true
    };

    C$.inherit('CreasetophDialogAlert','CreasetophDialogCustom').prototype = {
        dynamic_events              : true,
        dialog_height               : 19,
        dialog_width                : 220,
        dialog_custom_base_class    : 'alert',
        dialog_center               : true,
        dialog_show_header          : true,
        dialog_resizeable           : false,
        dialog_closeable            : false,
        dialog_mask                 : true,
        dialog_header_text          : 'Loading...',
        dialog_content              : "<img src='../images/loading15.gif' />"
    };

    C$.inherit('CreasetophDialogStatic','CreasetophDialogHover').prototype = {
        cursor                      : 'help',
        dialog_height               : 50,
        dialog_width                : 200,
        dialog_custom_base_class    : '',
        dialog_center               : false,
        dialog_show_header          : false,
        dialog_resizeable           : false,
        dialog_no_overflow          : true,
        dialog_offset_top           : 20,
        dialog_offset_left          : 0
    };

    C$.inherit('CreasetophDialogMinimizeable','CreasetophDialogClick').prototype = {
        dynamic_events              : true,
        dialog_height               : 0,
        dialog_width                : '',
        dialog_min_height           : 0,
        dialog_custom_base_class    : '',
        dialog_center               : false,
        dialog_resizeable           : false,
        dialog_show_header          : true,
        dialog_minimizable          : true,
        dialog_minimized            : true,
        onClick: function(e) {
            this.open_dialog(e);
        }
    };
    
    C$.inherit('CreasetophDialogManager','CreasetophController').prototype = {

    };

})();
