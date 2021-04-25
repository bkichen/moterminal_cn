Util.createCPObject('cpw.general.comment');

cpw.general.comment.init = function(){
    $(function(){
        $('#btnAddReview').on('click', function(){
            $('#commentForm').removeClass('hide');
        });

        $('#cancelComment').on('click', function(){
            $('#commentForm').addClass('hide');
        });

        $(document).on('click', '.deleteComment', function(e){
            e.preventDefault();

            var record_id = $(this).attr('record_id');
            var contact_module = $(this).attr('contact_module');
            msg = "Are you sure you want to delete this record?\nYou cannot undo this action!";

            if(confirm(msg)){
                var url = "index.php?_spAction=delete" +
                "&record_id=" + record_id + '&contact_module=' + contact_module + "&widget=general_comment&showHTML=0" ;
                $.get(url, function(){
                    cpw.general.comment.reload();
                });
            }
        });

        $('#commentsList .reportAbuse a').livequery('click', function(e){
            e.preventDefault();
            var id = $(this).attr('cid');
            var url = $('#scopeRootAlias').val() + 'index.php?_spAction=reportAbuse&widget=general_comment&showHTML=0' ;
            $.get(url, {id:id}, function(text){
                cpw.general.comment.reload();
                Util.alert(text);
            });
        });
    });
}

cpw.general.comment.reload = function(){
    var url = $('input[name=w-general-comment_url]').val();
    $.get(url, function(data){
        $('.w-general-comment').addClass('to-remove');
        $(data).insertAfter('.w-general-comment');
        $('.w-general-comment.to-remove').remove();
        $('#frmComment').resetForm();
        $('#commentForm').hide('slow');
        Util.hideProgressInd();
    });
}

cpw.general.comment.cbAfterEdit = function(){
    $('.modal').modal('hide');
    cpw.general.comment.reload();
}