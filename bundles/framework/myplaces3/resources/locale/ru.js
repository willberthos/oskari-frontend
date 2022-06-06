Oskari.registerLocalization(
{
    "lang": "ru",
    "key": "MyPlaces3",
    "value": {
        "title": "Места",
        "desc": "",
        "guest": {
            "loginShort": "Авторизируйтесь, чтобы добавить ваши личные места на карте."
        },
        "tab": {
            "title": "Места",
            "nocategories": "У вас еще нет каких-либо сохраненных мест.", // PersonalData removal
            "maxFeaturesExceeded": "У вас слишком много личных мест. Пожалуйста, удалите несколько.", // PersonalData removal
            "publishCategory": {
                "privateTooltip": "Этот слой карты является частным. Нажмите здесь для его публикации.",
                "publicTooltip": "Этот слой карты является публичным. Нажмите здесь для отмены его публикации."
            },
            "addCategoryFormButton": "Новый слой карты", // PersonalData removal
            "addCategory": "Добавить слой карты",
            "editCategory": "Редактировать слой карты",
            "deleteCategory": "Удалить слой карты",
            "deleteDefault": "Слой карты по умолчанию нельзя удалить.",
            "grid": {
                "name": "Название места",
                "desc": "Описание места",
                "createDate": "Создано",
                "updateDate": "Обновлено",
                "measurement": "Размер",
                "edit": "Редактировать",
                "delete": "Удалить"
            },
            "confirm": {
                "deleteConfirm": "Вы хотите удалить слой карты \"{name}\"?",
                "categoryToPrivate": "Вы отменяете публикацию слоя карты {0}. После этого слой карты не может быть общедоступным и встроенным в другой картографический сервис. Также другие пользователи больше не могут просматривать этот слой карты.",
                "categoryToPublic": "Вы публикуете слой карты {0}. После этого слой карты может быть общедоступным и встроенным в другой картографический сервис. Также другие пользователи могут просматривать этот слой карты.",
                "deletePlace": "Вы хотите удалить место \"{name}\"?"
            },
            "deleteWithMove": {
                "name": "Вы удаляете слой карты:",
                "count": "Существует {count, несколоько, одно {# место} другие {# места}} на слое карты. Вы хотите:",
                "delete": "1. удалить слой карты и его {count, несколько, одно {место} другие {места}}",
                "move": "переместить {count, несколько, одно {место} другие {места}} в слой карты по умолчанию:"
            }
        },
        "tools": {
            "point": {
                "title": "Добавьте точку",
                "tooltip": "Нарисуйте точку и добавьте ее в ваши личные места. На одном объекте может быть несколько точек.",
                "add": "Нарисуйте точку, щелкнув карту.",
                "next": "Вы можете нарисовать несколько точек на одном объекте.",
                "edit": "Вы можете перемещать точки в другое место, щелкая по ним мышкой."
            },
            "line": {
                "title": "Добавить линию в Мои места",
                "tooltip": "Нарисуйте линию и добавьте ее в свои собственные места.",
                "add": "Нарисуйте линию на карте. Нажмите на точки разрыва. В завершение дважды щелкните конечную точку и нажмите \"Сохранить в Мои места\".",
                "next": "Вы можете переместить точки разрыва в другое место, щелкнув по ним мышью.",
                "edit": "Вы можете переместить точки разрыва в другое место, щелкнув по ним мышью.",
                "noResult": "0 m"
            },
            "area": {
                "title": "Добавить область в Мои места",
                "tooltip": "Нарисуйте область и добавьте ее в Мои места.",
                "add": "Нарисуйте область на карте. Нажмите на точки разрыва. В завершение дважды щелкните конечную точку и нажмите \"Сохранить в Мои места\".",
                "next": "Можно нарисовать несколько областей в одном объекте.",
                "edit": "Вы можете переместить точки разрыва в другое место, щелкнув по ним мышью.",
                "noResult": "0 m²"
            }
        },
        "buttons": {
            "savePlace": "Сохранить в Мои места",
            "movePlaces": "Переместить места и удалить",
            "deleteCategoryAndPlaces": "Удалить вместе с местами",
            "changeToPublic": "Опубликовать",
            "changeToPrivate": "Отменить публикацию"
        },
        "placeform": {
            "title": "Данные о местах",
            "tooltip": "Сохранить объект как свое собственное место. Пожалуйста, введите хотя бы название и описание. В завершение выберите слой карты, в котором будет сохранен объект, или создайте новый слой карты. Позже вы можете найти свои собственные места в меню Мои данные.",
            "previewLabel": "Просмотр изображений",
            "fields": {
                "name": "Название места",
                "description": "Описание места",
                "attentionText": "Текст, видимый на карте",
                "link": "Ссылка на дополнительную информацию",
                "imagelink": "Ссылка на изображение объекта"
            },
            "category": {
                "label": "Слой карты",
                "newLayer": "Создать новый слой",
                "choose": "или выберите один из существующих слоев карты:"
            },
            "validation": {
                "mandatoryName": "Отсутствует название места.",
                "invalidName": "Название места содержит запрещенные символы.",
                "invalidDesc": "Описание места содержит запрещенные символы.",
            }
        },
        "categoryform": {
            "layerName": "Название слоя карты",
            "styleTitle": "Стиль места",
            "validation": {
                "mandatoryName": "Отсутствует название слоя карты.",
                "invalidName": "Название слоя карты содержит недопустимые символы."
            }
        },
        "notification": {
            "place": {
                "saved": "Место было сохранено.",
                "deleted": "Место удалено.",
                "info": "Вы можете найти данное место в меню \"Мои данные\"."
            },
            "category": {
                "saved": "Слой карты был сохранен.",
                "updated": "Слой карты был обновлен.",
                "deleted": "Слой карты был удален."
            }
        },
        "error": {
            "generic": "Произошла системная ошибка.",
            "saveCategory": "Не удалось сохранить слой карты.",
            "deleteCategory": "Невозможно удалить слой карты.",
            "savePlace": "Место не удалось сохранить.",
            "deletePlace": "Место не может быть удалено. Попробуйте сделать это снова."
        }
    }
});
