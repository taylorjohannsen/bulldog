function bigDisplay(id) {
    let smallPhoto = document.getElementById(id).src;
    let bigPhoto = document.getElementById('big')
    
    bigPhoto.src = smallPhoto;
}