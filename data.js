var dispatch = d3.dispatch("dataLoaded", "mouseover", "mouseout");

d3.json("words.json", function(error, data)
{
    if (error) throw error;
    else
        dispatch.call('dataLoaded', null, data);
});

dispatch.call("mouseover");
dispatch.call("mouseout");