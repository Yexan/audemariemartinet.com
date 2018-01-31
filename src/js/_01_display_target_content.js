(function(){

  var targetChoices   = $('[target-choice]'),
      targetContents  = $('[target-content]'),
      activeClass     = 'active';


  var displayTargetContent = function(){
    targetChoices.removeClass(activeClass);
    $(this).addClass(activeClass);
    targetId = $(this).attr('target-choice');
    targetContents.removeClass(activeClass);
    $('[target-content*="'+ targetId +'"]').addClass(activeClass);
  };

  targetChoices.click(displayTargetContent);

})();