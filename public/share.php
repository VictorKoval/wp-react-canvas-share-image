<?php
/*
Plugin Name: Share Image Generator
Plugin URI: http://skillful.in.ua
Description: Generator.
Version: 1.0
Author: Victor
Author URI: http://skillful.in.ua
*/

function ShareImg_register()
{
    wp_register_script('script-shareimg', plugins_url( 'script.js', __FILE__ ), array(), '1.0.0', true);
    wp_register_style('style-shareimg', plugins_url( 'style.css', __FILE__ ), array(), '1.0.0', 'all');
}

function show_ShareImg_Box(){
    global $post;
    $share_img_id = get_post_meta($post->ID, "share_img_id", true);
    $img = wp_get_attachment_image_src($share_img_id, "full");
    if($img){
        $src = $img[0];
    }else{
        $src = "";
    }
    ?>
    <div style="font-family: ProximaNova-Semibold">Створити з:</div>
    <div
        id="thumbGenerator"
        data-nonce="<?= wp_create_nonce("media-form") ?>"
        data-shareImgURL="<?= $src ?>"
        data-shareImgSet="<?= $img ? '1' : '0' ?>"
        style="font-family: ProximaNova-Bold"
    ></div>
    <input type="hidden" id="share_img_id" name="share_img_id" value="<?= $share_img_id ?>">
    <?php
    wp_enqueue_style("style-shareimg");
    wp_enqueue_script("script-shareimg");
}

function ShareImg_add_meta_boxes()
{
    add_meta_box(
        'sharebox',
        'Картинка шеру',
        'show_ShareImg_Box',
        'post',
        'normal',
        'low'
    );
}

add_action('add_meta_boxes', 'ShareImg_add_meta_boxes');



function ShareImg_save_custom_fields($post_id)
{
    if (get_post_type($post_id) === 'post' && isset($_POST["share_img_id"])) {
        update_post_meta($post_id, "share_img_id", $_POST["share_img_id"]);
    }
}

add_action('save_post', 'ShareImg_save_custom_fields', 10, 1);

function meta_action(){
    try {
        if (!is_page() && is_single() && get_post_type(get_the_ID()) === 'post') {
            $share_img_id = get_post_meta(get_the_ID(), "share_img_id", true);
            $image = wp_get_attachment_image_src($share_img_id, "full");
            if ($image) {
                ?>
                <meta property="og:image" content="<?php echo $image[0]; ?>"/>
                <meta property="og:image:width" content="<?php echo $image[1]; ?>"/>
                <meta property="og:image:height" content="<?php echo $image[2]; ?>"/>
                <meta name="twitter:image" content="<?php echo $image[0]; ?>"/>
                <?php
            }
        }
    } catch (\Throwable $t){
        error_log($t->getMessage());
    }
}

add_action( 'wp_head', 'meta_action', 10, 0);
ShareImg_register();