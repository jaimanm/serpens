dico geb_name esse "Joshua";
constituo geb_age esse XXVIII;
pono geb_title esse "Latin Teacher";

si (geb_age > XXV) {
    dice! "Joshua est vetus";
} alio {
    dice! "Joshua est iuvenis";
}

pono year esse 2024;
dum (geb_age maior nullus) {
    si (geb_age sit I) {
      dice! "Joshua natus est in " + year;
    }
    dice! "Joshua est " + geb_age + " annorum;
    year--;
    geb_age--;
}


