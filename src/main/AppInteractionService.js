function AppInteractionService(toolBarHeight, hotKeysService, main) {

  this.toolBarHeight = toolBarHeight;
  
  this.currentFileId = null;
  this.currentCommentId = null;
  this.files = this.getFiles();

  this.hotKeysService = hotKeysService;

  this.main = main;
  this.tracker = null;
  }

AppInteractionService.prototype.attachFolderCollapseBehavior = function(element) {

  $(element).find('.jk-folder').click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(10, function () {
      $header.toggleClass('collapsed');
    });
  });
  
};

AppInteractionService.prototype.attachJumpOnClickBehavior = function(element) {

  var that = this;

  $(element).find('.jk-file').click(function () {
    that.scrollTo($('#' + $(this).data('file-id')));
    that.currentFileId = $(this).data('file-id').split('-')[1];
  });
  
  this.tracker = appear({
      init: function init(){
        console.log('dom is ready');
      },
      elements: function elements(){
        // work with all elements with the class "track"
        return $("[id^='diff-']");
      },
      appear: function appear(el){
        console.log('visible', el);
        that.currentFileId = el.id.split('-')[1];
        that.updateCurentDiffPos();
      },
      disappear: function disappear(el){
        console.log('no longer visible', el);
      },
      bounds: 40,
      reappear: true,
      debounce: 24
    });
};

AppInteractionService.prototype.scrollTo = function(element) {

  if (!$(element).length) return;

  var offTop = $(element).offset().top - this.toolBarHeight - 10;
  
  $('body').scrollTop(offTop);
  this.updateCurentDiffPos();
  
};

AppInteractionService.prototype.updateCurentDiffPos = function() {

  var id = null;
  
  // if (!this.getFiles) return;

  $.each(this.getFiles(), function(key, file) {    
    var rect = file.getBoundingClientRect();
    if (rect.top < 139) {
      id = $(file).attr("id");
    }
  });

  $('#jk-hierarchy').find('.jk-file.current').removeClass('current');
  $('#jk-hierarchy').find('.jk-file*[data-file-id="' + id + '"]').addClass('current');


  if ($('#jk-hierarchy').is(":visible") && $('#jk-hierarchy').find('.jk-file.current').is(":visible")) {
    while (isAbove()) {
      $('#jk-hierarchy').scrollTop($('#jk-hierarchy').scrollTop() - 10);  
    }

    while (isBelow()) {
      $('#jk-hierarchy').scrollTop($('#jk-hierarchy').scrollTop() + 10);  
    }  
  }
    

  function isAbove() {
    var pos = $('#jk-hierarchy').find('.jk-file.current').position();
    return pos && pos.top < 0;
  }

  function isBelow() {
    var pos = $('#jk-hierarchy').find('.jk-file.current').position();
    return pos && pos.top > $('#jk-hierarchy').height();
  }
	
};

AppInteractionService.prototype.getFiles = function() {
  return $('.file');
};

AppInteractionService.prototype.getComments = function() {
  return $('#files .js-comment');
};

AppInteractionService.prototype.getCurrentEl = function() {
  var files = this.getFiles();
  return files[this.currentFileId];
};

AppInteractionService.prototype.updateCurrentPos = function(keyCode) {
  if (this.currentFileId == null) {
    this.currentFileId = 0;
  }
  else if (this.currentFileId < this.files.length - 1 && keyCode == this.hotKeysService.getKeyCodeForNextDiff()) {
   this.currentFileId++; 
  }
  else if (this.currentFileId > 0 && keyCode == this.hotKeysService.getKeyCodeForPrevDiff()) {
   this.currentFileId--; 
  }
};

AppInteractionService.prototype.updateCurrentCommentPos = function(keyCode) {
  if (this.currentCommentId == null) {
    this.currentCommentId = 0;
  }
  else if (this.currentCommentId < this.getComments().length - 1 && keyCode == this.hotKeysService.getKeyCodeForNextComment()) {
   this.currentCommentId++; 
  }
  else if (this.currentCommentId > 0 && keyCode == this.hotKeysService.getKeyCodeForPrevComment()) {
   this.currentCommentId--; 
  }
};

AppInteractionService.prototype.getCurrentCommentEl = function() {
  return this.getComments()[this.currentCommentId];
};

AppInteractionService.prototype.respondToHotKey = function(keyCode) {

  if (this.hotKeysService.isValidKeyCodeForDiff(keyCode)) {
    this.updateCurrentPos(keyCode);
    var el = this.getCurrentEl();
    this.scrollTo(el);
    return;
  }

  if (this.hotKeysService.isValidKeyCodeForComment(keyCode)) {
    this.updateCurrentCommentPos(keyCode);
    var el = this.getCurrentCommentEl();
    this.scrollTo(el);
    return;
  }

  if (this.hotKeysService.isValidKeyCodeForSideBarToggle(keyCode)) {
    
    // If the sidebar does not exist, re-generate it.
    if (!this.isSidebarHaveContents()) {
      $('#jk-hierarchy').remove();
      this.main.generateApp();
    }
    
    var tree = $('#jk-hierarchy')
    if (this.isSidebarHaveContents()) {
      if($('#jk-hierarchy:visible').length) {
        $("html").css('margin-left', '')
        tree.hide();
      } else {
        $("html").css('margin-left', tree.width())
        tree.show();  

      }
    }
    else {
      $("#jk-notice").show().delay(600).fadeOut(600);
    }
    
  }

};

AppInteractionService.prototype.isSidebarHaveContents = function() {
  return $('#jk-hierarchy').length && $('#jk-hierarchy')[0].innerHTML;
};
