const addDataForm = document.getElementById('add-data-form');

addDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = addDataForm.title.value.trim();
    const body = addDataForm.body.value.trim();
    const token = localStorage.getItem("token");

    try{
        const res = await fetching('data/add', 'POST', { title, body }, token);
        if(!res.success){return alert(res.message)}
        alert('data added successfully');
        closeNewDataLayer();
        addDataForm.reset();
    } catch(err){
        console.log(err);
    }
})