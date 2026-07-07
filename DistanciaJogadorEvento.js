/*:
 * @plugindesc Plugin criado para calcular a distância do jogador até o objetivo para a ME do professor marcos.
 * @author Carlos Eduardo de Almeida Guimarães
 *
 * @help
 * ============================================================================
 * COMO USAR
 * ============================================================================
 *   DistanciaEvento [ID_do_Evento] [ID_da_Variavel] [Tipo]
 *
 * Onde:
 * - [ID_do_Evento]: O ID do evento no mapa atual.
 * - [ID_da_Variavel]: O ID da variável do jogo que vai guardar o resultado.
 * - [Tipo]: (Opcional) Use 'linha' para linha reta ou 'grade' para passos.
 *           Se não colocar nada, o padrão será 'linha'.
 *
 * Exemplos:
 *   DistanciaEvento 5 10 linha
 *   (Calcula a distância em linha reta até o Evento 5 e salva na Variável 10)
 *
 *   DistanciaEvento 3 15 grade
 *   (Calcula a distância em "passos" até o Evento 3 e salva na Variável 15)
 *
 */

(function() {
    'use strict';

    // comandos de plugin do MV
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        if (command && command.toLowerCase() === 'distanciaevento') {
            var eventId = parseInt(args[0], 10);
            var variableId = parseInt(args[1], 10);
            var type = args[2] ? args[2].toLowerCase() : 'linha';
            
            if (eventId && variableId) {
                var distance = 0;
                if (type === 'grade' || type === 'passos') {
                    distance = $gamePlayer.distanceToEventGrid(eventId);
                } else {
                    // Como variáveis do RPG Maker são inteiras por padrão, 
                    // arredondamos o valor da linha reta para evitar bugs visuais.
                    distance = Math.round($gamePlayer.distanceToEvent(eventId));
                }
                $gameVariables.setValue(variableId, distance);
            }
        }
    };

    // Nova função: Distância em Linha Reta
    Game_Player.prototype.distanceToEvent = function(eventId) {
        var event = $gameMap.event(eventId);
        if (!event) return 0;
        
        var dx = this.x - event.x;
        var dy = this.y - event.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Nova função: Distância em Grade/Passos
    Game_Player.prototype.distanceToEventGrid = function(eventId) {
        var event = $gameMap.event(eventId);
        if (!event) return 0;
        
        return Math.abs(this.x - event.x) + Math.abs(this.y - event.y);
    };

})();